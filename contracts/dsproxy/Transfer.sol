pragma solidity 0.8.6;

contract Transfer {
    function transferAllEth(address to) external {
        uint256 value = address(this).balance;
        (bool success, bytes memory data) = to.call{value: value}(new bytes(0));
        require(success, "Transfer failed");
    }
}