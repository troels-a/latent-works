//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.2;
import './ILW_00x0.sol';

interface IMeta_00x0 {

    function getArtwork(uint comp_id_, ILW_00x0.CompInfo memory comp_) external view returns(string memory);

}