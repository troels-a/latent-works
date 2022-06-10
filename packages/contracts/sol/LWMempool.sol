//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import './LTNT.sol';
import './lib/Rando.sol';

contract LWMempool {

    struct Pool {
        bytes items;
        string base;
        string seed;
        string seed1;
        string seed2;
    }

    string[] private _bases;

    constructor(){

    }


    function addBase(string memory base_) public {
        _bases.push(base_);
    }


    function generateImage(string memory seed_) public view returns(string memory){

        Pool memory pool_;

        pool_.base = _bases[Rando.number(pool_.seed2, 0, _bases.length)];
        
        uint age_ = 90;
        uint max = Rando.number(seed_, age_+1, age_+5); // Increase over time

        uint i;
        while(i < max){
            pool_.seed1 = string(abi.encodePacked(seed_, '1x', Strings.toString(i)));
            pool_.seed2 = string(abi.encodePacked(seed_, '1y', Strings.toString(i)));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < max){
            pool_.seed1 = string(abi.encodePacked(seed_, '2x', Strings.toString(i)));
            pool_.seed2 = string(abi.encodePacked(seed_, '2y', Strings.toString(i)));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < max){
            pool_.seed1 = string(abi.encodePacked(seed_, '3x', Strings.toString(i)));
            pool_.seed2 = string(abi.encodePacked(seed_, '3y', Strings.toString(i)));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        bytes memory svg_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin meet">',
                '<defs>',
                    '<style></style><rect id="bg" height="1000" width="1000" fill="white"/>',
                    '<rect id="shape1" width="50" height="',Strings.toString(Rando.number(string(abi.encodePacked(seed_, 'shape1')), 20, 300)),'"/>',
                    '<rect id="shape2" width="30" height="',Strings.toString(Rando.number(string(abi.encodePacked(seed_, 'shape2')), 20, 200)),'"/>',
                    '<rect id="shape3" width="20" height="',Strings.toString(Rando.number(string(abi.encodePacked(seed_, 'shape3')), 20, 100)),'"/>',
                    '<pattern id="base1" x="0" y="0" width="1" height="1" viewBox="0 0 200 200"><image width="1000" height="1000" href="',pool_.base,'"/></pattern>',
                    '<pattern id="base2" x="0" y="0" width="1" height="1" viewBox="200 200 200 200" preserveAspectRatio="xMidYMid slice"><image width="1000" height="1000" href="',pool_.base,'"/></pattern>',
                    '<pattern id="base3" x="0" y="0" width="1" height="1" viewBox="400 400 200 200" preserveAspectRatio="xMidYMid slice"><image width="1000" height="1000" href="',pool_.base,'"/></pattern>',
                    '<pattern id="base4" x="0" y="0" width="1" height="1" viewBox="600 600 200 200" preserveAspectRatio="xMidYMid slice"><image width="1000" height="1000" href="',pool_.base,'"/></pattern>',
                    '<pattern id="base5" x="0" y="0" width="1" height="1" viewBox="800 800 200 200" preserveAspectRatio="xMidYMid slice"><image width="1000" height="1000" href="',pool_.base,'"/></pattern>',
                    '<filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="5" /></filter>',
                '</defs>',
                '<use href="#bg"/>',
                // '<rect fill-opacity="0.25" width="1000" height="1000" fill="url(#base1)"/>',
                // '<rect fill-opacity="0.25" width="1000" height="1000" fill="url(#base2)"/>',
                // '<rect fill-opacity="0.25" width="1000" height="1000" fill="url(#base3)"/>',
                // '<rect fill-opacity="0.25" width="1000" height="1000" fill="url(#base4)"/>',
                '<g filter="url(#blur)" transform="translate(0, -100)" id="pool">',
                pool_.items,
                pool_.items,
                pool_.items,
                '</g>',
                '<use href="#pool" transform="scale(.5, 0.5)"/>',
                '<use href="#pool" transform="scale(.5, 0.5) translate(0, 1000)"/>'
                '<use href="#pool" transform="scale(0.8, 0.8) translate(1000, 0)"/>'
                '<use href="#pool" transform="scale(1, 1.5) translate(500, 500)"/>'
            '</svg>'
        );

        return string(svg_);

    }

}