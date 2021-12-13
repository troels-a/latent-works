// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface LW_77x7_Interface is IERC1155 {

    struct Work {
      uint token_id;
      string name;
      string description;
      string image;
      string[7] iterations;
      string[7] colors;
    }

    function getPalette(uint token_id) external view returns(string[] memory);
    function getColor(uint token_id, uint iteration) external view returns(string memory);
    function getMinter(uint token_id, uint edition) external view returns(address);
    function getWork(uint token_id) external view returns(Work memory);

}