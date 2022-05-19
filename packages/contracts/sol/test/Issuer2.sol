// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../LTNT.sol";

contract Issuer2 is LTNTIssuer {

    function LTNTInfo(uint id_, LTNT.Param memory param_) public pure override returns(LTNT.Info memory){
        return LTNT.Info('issuer 2', 0, '');
    }

}