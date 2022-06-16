//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import './LTNT.sol';
import './lib/Rando.sol';

contract LWMempoolGenerator is ERC721 {

    struct Pool {
        bytes items;
        string base;
        string seed;
        string seed1;
        string seed2;
        uint epoch;
        uint max;
    }

    uint public constant MAX_EPOCHS = 10;

    uint private _pool_ids;
    mapping(uint => uint) private _pool_timestamps;
    mapping(uint => address) private _pool_minters;
    string[] private _bases;

    constructor() ERC721("Mempools: issue 1", "MEMPOOLS1"){

    }


    function mint() public {

        _pool_ids++;

        _mint(msg.sender, _pool_ids);

        _pool_timestamps[_pool_ids] = block.timestamp;
        _pool_minters[_pool_ids] = msg.sender;
        
    }


    function addBase(string memory base_) public {
        _bases.push(base_);
    }

    function getSeed(uint pool_id_, string memory append_) public view returns(string memory){
        return string(abi.encodePacked(Strings.toString(_pool_timestamps[pool_id_]), append_));
    }

    function getEpochLength(uint pool_id_) public view returns(uint){
        return Rando.number(getSeed(pool_id_, ''), 1, 6)*7776000;
    }

    function getCurrentEpoch(uint pool_id_) public view returns(uint){
        uint epoch = ((block.timestamp - _pool_timestamps[pool_id_]) / getEpochLength(pool_id_))+1;
        if(epoch > MAX_EPOCHS)
            return MAX_EPOCHS;
        return epoch;
    }

    function getEpochImage(uint pool_id_, uint epoch_, bool encode_) public view returns(string memory){

        Pool memory pool_;
        pool_.epoch = getCurrentEpoch(pool_id_); // Advances in different increments for each

        require(epoch_ <= pool_.epoch, 'EPOCH_NOT_REACHED');

        pool_.seed = getSeed(pool_id_, 'base_seed');
        pool_.base = _bases[Rando.number(pool_.seed, 0, _bases.length)];
        pool_.max = pool_.epoch;

        uint i;
        while(i < pool_.max){
            pool_.seed1 = getSeed(pool_id_, string(abi.encodePacked('1x', Strings.toString(i))));
            pool_.seed2 = getSeed(pool_id_, string(abi.encodePacked('1y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = getSeed(pool_id_, string(abi.encodePacked('2x', Strings.toString(i))));
            pool_.seed2 = getSeed(pool_id_, string(abi.encodePacked('2y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = getSeed(pool_id_, string(abi.encodePacked('3x', Strings.toString(i))));
            pool_.seed2 = getSeed(pool_id_, string(abi.encodePacked('3y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        bytes memory svg_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin meet">',
                '<defs>',
                    '<style></style><rect height="1000" width="1000" id="bg"/>',
                    '<clipPath id="clip"><use href="#bg"/></clipPath>',
                    '<rect id="shape1" width="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape1width'), 1, 50)),'" height="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape1height'), 20, 300)),'"/>',
                    '<rect id="shape2" width="30" height="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape2width'), 20, 200)),'"/>',
                    '<rect id="shape3" width="20" height="',Strings.toString(Rando.number(getSeed(pool_id_, 'shape3width'), 20, 100)),'"/>',
                    '<image id="base" width="1000" height="1000" href="',pool_.base,'"/>',
                    '<pattern id="base1" x="0" y="0" width="1" height="1" viewBox="0 0 200 200"><use href="#base"/></pattern>',
                    '<pattern id="base2" x="0" y="0" width="1" height="1" viewBox="200 200 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base3" x="0" y="0" width="1" height="1" viewBox="400 400 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base4" x="0" y="0" width="1" height="1" viewBox="600 600 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base5" x="0" y="0" width="1" height="1" viewBox="800 800 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="4" /></filter>',
                '</defs>',
                '<g clip-path="url(#clip)">',
                '<use href="#bg" fill="black"/>',
                '<use href="#bg" fill-opacity="0.8" fill="url(#base',Strings.toString(Rando.number(getSeed(pool_id_, 'bg1'), 2, 5)),')"/>',
                '<use href="#bg" fill-opacity="0.8" fill="url(#base',Strings.toString(Rando.number(getSeed(pool_id_, 'bg2'), 2, 5)),')"/>',
                '<g filter="url(#blur)" transform="translate(0, -100)" id="pool">',
                pool_.items,
                '</g>',
                '<use href="#pool" transform="scale(.5, 0.5)"/>',
                '<use href="#pool" transform="scale(.5, 0.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 100)),', 1000)"/>'
                '<use href="#pool" transform="scale(0.8, 0.8) translate(1000, 0)"/>'
                '<use href="#pool"  transform="scale(1, 1.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 500)),', ',Strings.toString(Rando.number(pool_.seed, 0, 500)),')"/>',
                '</g>',
            '</svg>'
        );

        if(encode_)
            return Base64.encode(svg_);

        return string(svg_);

    }

}