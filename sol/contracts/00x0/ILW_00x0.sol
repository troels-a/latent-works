//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import './../77x7/ILW_77x7.sol';
import './IMeta_00x0.sol';

interface ILW_00x0 is IERC1155 {
    
    enum Orientation{LANDSCAPE, PORTRAIT}

    struct CompInfo {
        string id_string;
        bool mark;
        string seed;
        string seed0;
        string seed1;
        string seed2;
        string seed3;
        uint[] works;
        bytes defs;
        bytes ani_elements;
        bytes elements;
        uint left;
        uint right;
        Orientation orientation;
        string width_string;
        string height_string;
        string[2] pos;
        uint start;
        uint last_left;
        uint last_right;
        bytes begin_t;
        bytes translate;
        bytes scale;
    }

    struct Comp {
        uint id;
        address creator;
        uint seed;
        string artwork;
        Orientation orientation;
        uint price;
        uint editions;
        uint available;
    }

    function get77x7() external view returns(ILW_77x7);
    function create(uint[] memory works_) external;
    function mint(uint comp_id_) external payable;
    function getComp(uint comp_id_) external view returns(Comp memory);
    function getComps(uint limit_, uint page_) external view returns(Comp[] memory);
    function getAvailable(uint comp_id_) external view returns(uint);
    function getSeed(uint comp_id_, string memory salt_) external view returns(string memory);
    function getArtwork(uint comp_id_, bool mark_, bool encode_) external view returns(string memory output_);
    function totalSupply(uint256 id) external view returns (uint256);
    function exists(uint256 id) external view returns (bool);

}