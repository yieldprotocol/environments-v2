// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;

import "./NotionalJoin.sol";
import "@yield-protocol/utils-v2/contracts/access/AccessControl.sol";

/// @dev NotionalJoinFactory creates new join instances supporting Notional Finance's fCash tokens.
/// @author @calnix 
contract NotionalJoinFactory is AccessControl() {

    NotionalJoin[] public njoins;
    address public cloak;
    address public timelock;

    event JoinCreated(address indexed asset, address indexed join);

    constructor(address cloak_, address timelock_){
        cloak = cloak_;
        timelock = timelock_;

        // grant ROOT to timelock
        _grantRole(ROOT, timelock);
        // revoke role of deployer | msg.sender = deployer in constructor
        _revokeRole(ROOT, msg.sender);
    }

    /// @dev Deploys a new notional join using create2
    /// @param asset Address of the ERC1155 token. (e.g. fDai2203)
    /// @param underlying Address of the underlying token. (e.g. Dai)
    /// @param underlyingJoin Address of the underlying join contract. (e.g. Dai join contract)
    /// @param maturity Maturity of fCash token. (90-day intervals)
    /// @param currencyId ERC21155 ID of the fCash token
    /// @param salt Random number of choice
    /// @return join Deployed notional join address.  
    function deploy(address asset, address underlying, address underlyingJoin, uint40 maturity, uint16 currencyId, uint256 salt) external auth returns (address) {
        
        NotionalJoin njoin = new NotionalJoin{salt: bytes32(salt)}(asset, underlying, underlyingJoin, maturity, currencyId);
        
        njoins.push(njoin);

        _orchestrateJoin(address(njoin));

        emit JoinCreated(asset, address(njoin));
        return address(njoin);
    }
    
    /// @dev Get address of contract to be deployed
    /// @param bytecode Bytecode of the contract to be deployed (include constructor params)
    /// @param salt Random number of choice
    function getAddress(bytes memory bytecode, uint256 salt) public view returns (address){
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
    function getByteCode(address asset, address underlying, address underlyingJoin, uint40 maturity, uint16 currencyId) public pure returns (bytes memory) {
        
        bytes memory bytecode = type(NotionalJoin).creationCode;

        //append constructor arguments
        return abi.encodePacked(bytecode, abi.encode(asset, underlying, underlyingJoin, maturity, currencyId));
    }

    /// @notice Orchestrate the join to grant & revoke the correct permissions
    /// @param joinAddress Address of the join to be orchestrated
    function _orchestrateJoin(address joinAddress) internal {
        AccessControl njoin = AccessControl(joinAddress);

        // grant ROOT to cloak
        njoin.grantRole(ROOT, cloak);
        // revoke ROOT from NotionalJoinFactory
        njoin.renounceRole(ROOT, address(this));
    }

} 