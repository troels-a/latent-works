// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

library Rando {

    function number(string memory seed, uint min, uint max) internal pure returns (uint) {
      uint num = uint(keccak256(abi.encode(seed))) % max;
      return num >= min ? num : min;
    }

}