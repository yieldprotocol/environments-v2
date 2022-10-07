// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.13;

import '@yield-protocol/vault-v2/contracts/other/notional/NotionalJoin.sol';
import '@yield-protocol/utils-v2/contracts/access/AccessControl.sol';
import {IEmergencyBrake} from '@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol';
import {ILadleGov} from '@yield-protocol/vault-v2/contracts/interfaces/ILadleGov.sol';
import {INotionalJoin} from '@yield-protocol/vault-v2/contracts/other/notional/interfaces/INotionalJoin.sol';
import {ILadle} from '@yield-protocol/vault-v2/contracts/interfaces/ILadle.sol';

/// @dev NotionalJoinFactory creates new join contracts supporting Notional Finance's fCash tokens.
/// @author @calnix, @alcueca
contract NotionalJoinFactory is AccessControl {

    ILadleGov public ladle;

    event JoinCreated(address indexed join);
    event Point(bytes32 indexed param, address indexed oldValue, address indexed newValue);

    error UnrecognisedParam(bytes32 param);

    constructor(ILadleGov ladle_) {
        ladle = ladle_;
    }

    /// @dev Deploys a new notional join using create2
    /// @param oldAssetId Id of prior matured fCash token. (e.g. fDAIJUN22)
    /// @param salt Random number of choice
    /// @return join Deployed notional join address
    function deploy(
        bytes6 oldAssetId,
        uint256 salt
    ) external auth returns (NotionalJoin) {

        (address asset, address underlying, address underlyingJoin, uint40 maturity, uint16 currencyId) = getParams(oldAssetId, salt);

        NotionalJoin join = new NotionalJoin{salt: bytes32(salt)}(
            asset, // The fCash address
            underlying,      // The underlying asset, e.g. DAI
            underlyingJoin,
            maturity,
            currencyId
        );

        address joinAddress = address(join);

        // grant ROOT to msg.sender
        AccessControl(joinAddress).grantRole(ROOT, msg.sender);  
        // revoke ROOT from NotionalJoinFactory
        AccessControl(joinAddress).renounceRole(ROOT, address(this));

        emit JoinCreated(address(join));
        return join;
    }

    /// @dev Return the parameters for a regular deployment of a NotionalJoin from a previous one
    /// @param oldAssetId Id of prior matured fCash token. (e.g. fDAIJUN22)
    /// @param salt Random number of choice
    function getParams(
        bytes6 oldAssetId,
        uint256 salt
    ) public returns (address asset, address underlying, address underlyingJoin, uint40 maturity, uint16 currencyId) {
        // get join of oldAssetId
        INotionalJoin oldJoin = INotionalJoin(address(ladle.joins(oldAssetId)));

        require(address(oldJoin) != address(0), "oldAssetId invalid");

        // Check that oldJoin is a NotionalJoin. Only protects against honest mistakes.
        (bool success,) = address(oldJoin).call(abi.encodeWithSelector(INotionalJoin.fCashId.selector, ""));
        require(success, "Input not a NotionalJoin");
        
        // get underlying, underlyingJoin addresses
        asset = oldJoin.asset();    // The fCash address
        underlying = oldJoin.underlying(); // The underlying asset, e.g. DAI
        underlyingJoin = oldJoin.underlyingJoin();
        
        // get new maturity
        currencyId = oldJoin.currencyId();
        maturity = oldJoin.maturity() + 90 days;

    }

    /// @dev Return the address for a given notional join using create2
    /// @param oldAssetId Id of prior matured fCash token. (e.g. fDAIJUN22)
    /// @param salt Random number of choice
    /// @return join Notional join address
    function getAddress(
        bytes6 oldAssetId,
        uint256 salt
    ) external returns (address) {
        (address asset, address underlying, address underlyingJoin, uint40 maturity, uint16 currencyId) = getParams(oldAssetId, salt);
        
        // Append creation arguments to contract bytecode
        bytes memory bytecode = abi.encodePacked(type(NotionalJoin).creationCode, abi.encode(asset, underlying, underlyingJoin, maturity, currencyId));

        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode)));

        // cast last 20 bytes of hash to address
        return address(uint160(uint256(hash)));
    }

    /// @dev Point to a different ladle
    /// @param param Name of parameter to set (must be "ladle")
    /// @param value Address of new contract
    function point(bytes32 param, address value) external auth {
        if (param != "ladle") {
            revert UnrecognisedParam(param);
        }
        address oldLadle = address(ladle);
        ladle = ILadleGov(value);
        emit Point(param, oldLadle, value);
    }
}
