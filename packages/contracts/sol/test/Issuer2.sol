// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../LTNT.sol";

contract Issuer2 is LTNTIssuer {

    function issuerInfo(uint, LTNT.Param memory) public pure override returns(LTNT.IssuerInfo memory){
        return LTNT.IssuerInfo('issuer 2', '');
    }

}