//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import './LTNT.sol';
import './lib/Rando.sol';
import 'hardhat/console.sol';

contract LWMempools is ERC721, LTNTIssuer, Ownable {

    struct Bank {
        string _name;
        string[] _parts;
        string _filter;
        uint[15] _pools;
    }

    uint public constant MAX_BANKS = 15;
    uint public constant PRICE = 0.15 ether;

    uint private _pool_ids;
    Bank[] private _banks;
    mapping(uint => uint) private _pool_timestamps;
    mapping(uint => uint) private _pool_banks;
    mapping(uint => uint) private _pool_fixed_epochs;

    LTNT public immutable _ltnt;
    LWMempools_Meta public immutable _meta;

    constructor(address ltnt_) ERC721("Mempools", "MEMPOOLS"){
        _ltnt = LTNT(ltnt_);
        _meta = new LWMempools_Meta();
    }

    function issuerInfo(uint, LTNT.Param memory param_) public view override returns(LTNT.IssuerInfo memory){
        return LTNT.IssuerInfo('mempools', getImage(param_._uint, true));
    }

    function addBank(string memory name, string[] memory parts_, string memory _filter) public onlyOwner {
        require(_banks.length < MAX_BANKS, "MAX_BANKS");
        uint[15] memory pools_;
        _banks.push(Bank(name, parts_, _filter, pools_));
    }

    function getBanks() public view returns(Bank[] memory){
        return _banks;
    }

    function getBank(uint index_) public view returns(Bank memory) {
        return _banks[index_];
    }

    function getBankCount() public view returns(uint) {
        return _banks.length;
    }

    function getPoolFilter(uint pool_id_) public view returns(string memory){
        return _banks[_pool_banks[pool_id_]]._filter;
    }

    function exists(uint pool_id_) public view returns(bool) {
        return _exists(pool_id_);
    }

    function mintWithLTNT(uint ltnt_id_, uint bank_, uint index_) public payable {
        require(msg.value == (PRICE/3)*2, 'INVALID_PRICE');
        require(_ltnt.ownerOf(ltnt_id_) == msg.sender, 'NOT_LTNT_HOLDER');
        require(!_ltnt.hasStamp(ltnt_id_, address(this)), 'ALREADY_STAMPED');
        uint id_ = _mintFor(msg.sender, bank_, index_);
        _ltnt.stamp(ltnt_id_, LTNT.Param(id_, address(0), '', false));
    }


    function mint(uint bank_, uint index_) public payable {

        require(msg.value == PRICE, 'INVALID_PRICE');
        require(bank_ < _banks.length, 'INVALID_BANK');
        require(_banks[bank_]._pools[index_] == 0, 'POOL_INDEX_USED');

        _mintFor(msg.sender, bank_, index_);

    }


    function _mintFor(address for_, uint bank_, uint index_) private returns(uint) {

        _pool_ids++;

        _mint(for_, _pool_ids);

        _pool_timestamps[_pool_ids] = block.timestamp;
        _pool_banks[_pool_ids] = bank_;
        _banks[bank_]._pools[index_] = _pool_ids;

        return _pool_ids;

    }

    function getPoolBankIndex(uint pool_id_) public view returns(uint){
        return _pool_banks[pool_id_];
    }

    function getPoolBank(uint pool_id_) public view returns(LWMempools.Bank memory){
        return getBank(getPoolBankIndex(pool_id_));
    }


    function getPoolBankPart(uint pool_id_) public view returns(uint){
        Bank memory bank_ = getPoolBank(pool_id_);
        string memory seed_part_ = getSeed(pool_id_, 'part');
        return Rando.number(seed_part_, 0, bank_._parts.length-1);
    }

    function getBankPart(uint pool_id_) public view returns(string memory){
        LWMempools.Bank memory bank_ = getPoolBank(pool_id_);
        return bank_._parts[getPoolBankPart(pool_id_)];
    }


    function getSeed(uint pool_id_, string memory append_) public view returns(string memory){
        return string(abi.encodePacked(Strings.toString(_pool_timestamps[pool_id_]), Strings.toString(pool_id_), append_));
    }

    function getEpochLength(uint pool_id_) public view returns(uint){
        return Rando.number(getSeed(pool_id_, 'epoch'), 1, 6)*7776000;
    }

    function getCurrentEpoch(uint pool_id_) public view returns(uint){
        uint epoch = (((block.timestamp - _pool_timestamps[pool_id_]) / getEpochLength(pool_id_))+1);
        return epoch;
    }

    function fixEpoch(uint pool_id_, uint epoch_) public {
        require(ownerOf(pool_id_) == msg.sender, 'NOT_OWNER');
        require(getCurrentEpoch(pool_id_) <= epoch_, 'EPOCH_NOT_REACHED');
        _pool_fixed_epochs[pool_id_] = epoch_;
    }

    function getImage(uint pool_id_, bool encode_) public view returns(string memory){

        if(!exists(pool_id_))
            return '';

        uint epoch_ = _pool_fixed_epochs[pool_id_];
        if(epoch_ < 1) // Fixed epoch is 0, go to current epoch
            epoch_ = getCurrentEpoch(pool_id_);

        return _meta.getEpochImage(pool_id_, epoch_, encode_);

    }

    function tokenURI(uint pool_id_) override public view returns(string memory) {
        
        LWMempools.Bank memory bank_ = getPoolBank(pool_id_);

        bytes memory json_ = abi.encodePacked(
            '{',
                '"name":"mempool #',Strings.toString(pool_id_),'", ',
                '"image": "', getImage(pool_id_, true),'", ',
                '"description": "infinitly evolving mempools",',
                '"attributes": [',
                    '{"trait_type": "bank", "value": "',bank_._name,'"},',
                    '{"trait_type": "bank_index", "value": "',bank_._name,'-',Strings.toString(getPoolBankPart(pool_id_)),'"},',
                    '{"trait_type": "epoch", "value": ', Strings.toString(getCurrentEpoch(pool_id_)), '},',
                    '{"trait_type": "fixed_epoch", "value": ', Strings.toString(_pool_fixed_epochs[pool_id_]), '},',
                    '{"trait_type": "epoch_length", "value": ', Strings.toString(getEpochLength(pool_id_)), '}',
                ']',
            '}'
        );

        json_ = abi.encodePacked('data:application/json;base64,', Base64.encode(json_));
        
        return string(json_);

    }

    // Balance
    function withdrawAll() public payable onlyOwner {
      require(payable(msg.sender).send(address(this).balance));
    }

}


contract LWMempools_Meta is Ownable {
    
    struct Pool {
        uint id;
        bytes items;
        string base;
        string seed;
        string seed1;
        string seed2;
        string filter;
        uint epoch;
        uint max;
        string shape1_width;
        string shape1_height;
        string shape2_width;
        string shape2_height;
        string shape3_width;
        string shape3_height;
    }

    struct Bank {
        string name;
        string[4] parts;
    }

    uint private _bases_count;
    mapping(uint => Bank) private _bases;
    LWMempools public immutable _pools;

    constructor(){
        _pools = LWMempools(msg.sender);
    }

    function getEpochImage(uint pool_id_, uint epoch_, bool encode_) public view returns(string memory){

        if(!_pools.exists(pool_id_))
            return '';

        Pool memory pool_;
        pool_.epoch = _pools.getCurrentEpoch(pool_id_); // Advances in different increments for each

        if(epoch_ > pool_.epoch)
            return '';
        
        pool_.id = pool_id_;
        pool_.seed = _pools.getSeed(pool_id_, 'bank_seed');
        pool_.base = _pools.getBankPart(pool_id_);
        pool_.filter = _pools.getPoolFilter(pool_id_);
        pool_.max = pool_.epoch;

        uint i;
        while(i < pool_.max){
            pool_.seed1 =_pools.getSeed(pool_id_, string(abi.encodePacked('1x', Strings.toString(i))));
            pool_.seed2 = _pools.getSeed(pool_id_, string(abi.encodePacked('1y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = _pools.getSeed(pool_id_, string(abi.encodePacked('2x', Strings.toString(i))));
            pool_.seed2 = _pools.getSeed(pool_id_, string(abi.encodePacked('2y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        i = 0;
        while(i < pool_.max){
            pool_.seed1 = _pools.getSeed(pool_id_, string(abi.encodePacked('3x', Strings.toString(i))));
            pool_.seed2 = _pools.getSeed(pool_id_, string(abi.encodePacked('3y', Strings.toString(i))));
            pool_.items = abi.encodePacked(
                pool_.items,
                '<use href="#shape',Strings.toString(Rando.number(pool_.seed1, 1, 3)),'" x="',Strings.toString(Rando.number(pool_.seed1, 1, 990)),'" y="',Strings.toString(Rando.number(pool_.seed2, 1, 900)),'" fill="url(#base',Strings.toString(Rando.number(pool_.seed2, 1, 5)),')"/>'
            );

            ++i;
        }

        pool_.shape1_width = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape1width'), 1, 50));
        pool_.shape1_height = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape1height'), 20, 300));
        pool_.shape2_width = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape2width'), 20, 30));
        pool_.shape2_height = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape2height'), 20, 200));
        pool_.shape3_width = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape2height'), 10, 30));
        pool_.shape3_height = Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'shape3width'), 20, 100));

        bytes memory svg_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin meet">',
                '<defs>',
                    '<circle cx="500" cy="500" r="500" id="bg"/>',
                    '<filter id="none"><feColorMatrix in="SourceGraphic" type="saturate" values="1"/></filter>',
                    '<filter id="bw"><feColorMatrix type="matrix" values="0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.491 1.650 0.166 0.000 -0.464 0.000 0.000 0.000 1.000 0.000"></feColorMatrix></filter>',
                    '<filter id="s1"><feColorMatrix in="SourceGraphic" type="saturate" values="2"/></filter>',
                    '<filter id="s2"><feColorMatrix in="SourceGraphic" type="saturate" values="4"/></filter>',
                    '<filter id="s3"><feColorMatrix in="SourceGraphic" type="saturate" values="6"/></filter>',
                    '<filter id="s4"><feColorMatrix in="SourceGraphic" type="saturate" values="8"/></filter>',
                    '<filter id="s5"><feColorMatrix in="SourceGraphic" type="saturate" values="10"/></filter>',
                    '<filter id="s6"><feColorMatrix in="SourceGraphic" type="saturate" values="12"/></filter>',
                    '<filter id="s7"><feColorMatrix in="SourceGraphic" type="saturate" values="14"/></filter>',
                    '<filter id="s8"><feColorMatrix in="SourceGraphic" type="saturate" values="16"/></filter>',
                    '<filter id="s9"><feColorMatrix in="SourceGraphic" type="saturate" values="18"/></filter>',
                    '<filter id="s10"><feColorMatrix in="SourceGraphic" type="saturate" values="20"/></filter>',
                    '<filter id="r1"><feColorMatrix in="SourceGraphic" type="hueRotate" values="20"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r2"><feColorMatrix in="SourceGraphic" type="hueRotate" values="40"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r3"><feColorMatrix in="SourceGraphic" type="hueRotate" values="60"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r4"><feColorMatrix in="SourceGraphic" type="hueRotate" values="80"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r5"><feColorMatrix in="SourceGraphic" type="hueRotate" values="100"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r6"><feColorMatrix in="SourceGraphic" type="hueRotate" values="120"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r7"><feColorMatrix in="SourceGraphic" type="hueRotate" values="140"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r8"><feColorMatrix in="SourceGraphic" type="hueRotate" values="160"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r9"><feColorMatrix in="SourceGraphic" type="hueRotate" values="180"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="r10"><feColorMatrix in="SourceGraphic" type="hueRotate" values="200"></feColorMatrix><feColorMatrix in="SourceGraphic" type="saturate" values="3"/></filter>',
                    '<filter id="internal-noise"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="10" stitchTiles="stitch" /></filter>',
                    '<filter id="internal-blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="4" /></filter>',
                    '<clipPath id="clip"><use href="#bg"/></clipPath>',
                    '<rect id="shape1" width="',pool_.shape1_width,'" height="',pool_.shape1_height,'"/>',
                    '<rect id="shape2" width="30" height="',pool_.shape2_height,'"/>',
                    '<rect id="shape3" width="20" height="',pool_.shape3_height,'"/>',
                    '<image id="base" width="1000" height="1000" href="',pool_.base,'"/>',
                    '<pattern id="base1" x="0" y="0" width="1" height="1" viewBox="0 0 200 200"><use href="#base"/></pattern>',
                    '<pattern id="base2" x="0" y="0" width="1" height="1" viewBox="200 200 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base3" x="0" y="0" width="1" height="1" viewBox="400 400 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base4" x="0" y="0" width="1" height="1" viewBox="600 600 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                    '<pattern id="base5" x="0" y="0" width="1" height="1" viewBox="800 800 200 200" preserveAspectRatio="xMidYMid slice"><use href="#base"/></pattern>',
                '</defs>',
                '<g filter="url(#',pool_.filter,')">',
                    '<rect width="1000" height="1000" fill="black"/>',
                    '<rect width="1000" height="1000" fill-opacity="0.5" fill="url(#base',Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'bg0'), 2, 5)),')" filter="url(#bw)"/>',
                    '<g clip-path="url(#clip)">',
                        '<use href="#bg" fill-opacity="1" fill="url(#base',Strings.toString(Rando.number(_pools.getSeed(pool_.id, 'bg1'), 2, 5)),')"/>',
                    '<g filter="url(#internal-blur)" transform="translate(0, -100)" id="pool">',
                    pool_.items,
                    '</g>',
                    '<use href="#pool" transform="scale(.5, 0.5)"/>',
                    '<use href="#pool" transform="scale(.5, 0.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 100)),', 1000)"/>'
                    '<use href="#pool" transform="scale(0.8, 0.8) translate(1000, 0)"/>'
                    '<use href="#pool"  transform="scale(1, 1.5) translate(',Strings.toString(Rando.number(pool_.seed, 0, 500)),', ',Strings.toString(Rando.number(pool_.seed, 0, 500)),')"/>',
                    '</g>',
                    '<g filter="url(#bw)">',
                        '<rect width="1000" height="1000" fill="white" filter="url(#internal-noise)" opacity="0.15"/>',
                    '</g>',
                '</g>',
            '</svg>'
        );

        if(encode_)
            return string(abi.encodePacked('data:image/svg+xml;base64,', Base64.encode(svg_)));

        return string(svg_);

    }


}