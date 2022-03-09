//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface ILW_77x7 is IERC1155 {

    struct Work {
      uint token_id;
      string name;
      string description;
      string image;
      string[7] iterations;
      string[7] colors;
    }

    function getPalette(uint token_id) external view returns(string[7] memory);
    function getColor(uint token_id, uint iteration) external view returns(string memory);
    function getMinter(uint token_id, uint edition) external view returns(address);
    function getWork(uint token_id) external view returns(Work memory);
    function getSVG(uint token_id, uint edition_, bool mark_) external view returns(string memory);

}