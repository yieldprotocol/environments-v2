// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.13;

import '@yield-protocol/vault-v2/contracts/other/notional/NotionalJoin.sol';
import '@yield-protocol/utils-v2/contracts/access/AccessControl.sol';
import {IEmergencyBrake} from '@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol';
import {ILadleGov} from '@yield-protocol/vault-v2/contracts/interfaces/ILadleGov.sol';

interface IJoinCustom {
    /// @dev ERC1155 asset managed by this notional join
    function asset() external view returns (address);

    /// @dev underlying asset of this notional join
    function underlying() external view returns (address);

    /// @dev join of the underlying asset 
    function underlyingJoin() external view returns (address);

    /// @dev maturity date for fCash
    function maturity() external view returns (uint40);

    /// @dev otional currency id for the underlying
    function currencyId() external view returns (uint16);

}

/// @dev NotionalJoinFactory creates new join contracts supporting Notional Finance's fCash tokens.
/// @author @calnix
contract NotionalJoinFactory is AccessControl {

    mapping (bytes6 => uint256) public fcashAssets;  // maps assetId to fCashId

    address public cloak;
    address public timelock;
    ILadleGov public ladle;

    event JoinCreated(address indexed asset, address indexed join);
    event Added(bytes6 indexed assetId, uint256 indexed fCashId);

    constructor(address cloak_, address timelock_, ILadleGov ladle_) {
        cloak = cloak_;
        timelock = timelock_;
        ladle = ladle_;

        // grant ROOT to timelock
        _grantRole(ROOT, timelock);
        // revoke role of deployer | msg.sender = deployer in constructor
        _revokeRole(ROOT, msg.sender);
    }

    /// @dev Deploys a new notional join using create2
    /// @param oldAssetId Id of prior matured fCash token. (e.g. fDAIJUN22)
    /// @param newAssetId Id of incoming fCash token. (e.g. fDAISEP22)
    /// @param salt Random number of choice
    /// @return join Deployed notional join address
    function deploy(
        bytes6 oldAssetId,
        bytes6 newAssetId,
        address newAssetAddress,
        uint256 salt
    ) external auth returns (NotionalJoin) {
        require(fcashAssets[oldAssetId] != 0, "Invalid oldAssetId");  // ensure prior tenor of fCash exists (i.e. fDAIJUN22 to be mapped to fDAISEP22)  
        require(fcashAssets[newAssetId] == 0, "Invalid newAssetId");  // ensure asset does not already exist
        require(address(ladle.joins(newAssetId)) == address(0), "newAssetId join exists"); 

        // get join of oldAssetId
        IJoinCustom oldJoin = IJoinCustom(address(ladle.joins(oldAssetId)));
        
        // get underlying, underlyingJoin addresses
        address underlying = oldJoin.underlying(); 
        address underlyingJoin = oldJoin.underlyingJoin();
        
        // get new maturity
        uint16 currencyId = oldJoin.currencyId();
        uint40 oldMaturity = oldJoin.maturity();
        uint40 maturity = oldMaturity + (86400 * 90);    // 90-days in seconds
  
        NotionalJoin join = new NotionalJoin{salt: bytes32(salt)}(
            newAssetAddress,
            underlying,
            underlyingJoin,
            maturity,
            currencyId
        );

        // update mapping with new fCashId
        uint256 fCashId = join.id();
        fcashAssets[newAssetId] = fCashId;

        _orchestrateJoin(address(join));

        emit JoinCreated(newAssetAddress, address(join));
        return join;
    }

    /// @dev Get address of contract to be deployed
    /// @param bytecode Bytecode of the contract to be deployed (include constructor params)
    /// @param salt Random number of choice
    function getAddress(bytes memory bytecode, uint256 salt) public view returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode)));

        // cast last 20 bytes of hash to address
        return address(uint160(uint256(hash)));
    }

    /// @dev Get bytecode of contract to be deployed
    /// @param asset Address of the ERC1155 token. (e.g. fDai2203)
    /// @param underlying Address of the underlying token. (e.g. Dai)
    /// @param underlyingJoin Address of the underlying join contract. (e.g. Dai join contract)
    /// @param maturity Maturity of fCash token. (90-day intervals)
    /// @param currencyId Maturity of fCash token. (90-day intervals)
    /// @return bytes Bytecode of notional join to be passed into getAddress()
    function getByteCode(
        address asset,
        address underlying,
        address underlyingJoin,
        uint40 maturity,
        uint16 currencyId
    ) public pure returns (bytes memory) {
        bytes memory bytecode = type(NotionalJoin).creationCode;

        //append constructor arguments
        return abi.encodePacked(bytecode, abi.encode(asset, underlying, underlyingJoin, maturity, currencyId));
    }

    /// @notice Orchestrate the join to grant & revoke the correct permissions
    /// @param joinAddress Address of the join to be orchestrated
    function _orchestrateJoin(address joinAddress) internal {
        AccessControl join = AccessControl(joinAddress);

        // grant ROOT to cloak & timelock
        join.grantRole(ROOT, cloak);
        join.grantRole(ROOT, timelock);
        // revoke ROOT from NotionalJoinFactory
        join.renounceRole(ROOT, address(this));
    }
    
    /// @notice To manually register existing fCash assetIds that were created 
    function addFCash(bytes6 assetId, uint256 fCashId) external auth {
        require(fcashAssets[assetId] == 0, "AssetId exists");

        fcashAssets[assetId] = fCashId;

        emit Added(assetId, fCashId);
    } 
}
