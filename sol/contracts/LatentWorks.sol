//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import 'base64-sol/base64.sol';
import 'hardhat/console.sol';

/**

          ___  ___      ___        __   __        __  
|     /\   |  |__  |\ |  |   |  | /  \ |__) |__/ /__` 
|___ /~~\  |  |___ | \|  |  .|/\| \__/ |  \ |  \ .__/ 
                                                      

author: Troels Abrahamsen
year: 2021
description: Work determined by code, brought to being by people

*/

contract LatentWorks is ERC1155, ERC1155Supply, Ownable {

    uint public constant MAX_WORKS = 77;
    uint public constant MAX_EDITIONS = 7;

    // Tokens
    using Counters for Counters.Counter;
    Counters.Counter private _token_id_tracker;
    uint private _released = MAX_WORKS;
    uint private _editions = 1;
    uint private _created = 0;
    uint private _minted = 0;
    uint private _total = MAX_WORKS*MAX_EDITIONS;
    uint private _price = 0.02 ether;

    // Works
    struct Work {
        string[7] colors;
        uint[7] X;
        uint[7] Y;
        uint[7] R;
    }
    mapping(uint256 => Work) private _works;
    address[] private _creators;
    event Create(uint256 id, Work);

    // Canvas
    uint private _size = 777;
    uint private _palette_count = 3;
    mapping(uint256 => string[]) private _palettes;

    constructor() ERC1155("") {

      _palettes[1] = ["#82968c","#6a706e","#ffd447","#ff5714","#170312","#0cf574","#f9b4ed"];
      _palettes[2] = ["#f59ca9","#775253","#01fdf6","#cff27e","#294d4a","#0cf574","#0e103d"];
      _palettes[3] = ['rgba(90, 232, 89, 0.706)', 'rgba(255, 98, 98, 0.706)', 'rgba(79, 42, 109, 0.706)', 'rgba(0, 255, 208, 0.769)', 'pink', '#888', 'black'];
      
      // for(uint256 index = 0; index < initialMint.length; index++){
      //   _mintTo(initialMint[index]);
      // }

      // uint i = 0;
      // while(i <= MAX_WORKS){
      //   _create(i);
      //   i++;
      // }

    }
    
    // Return random seed string
    function _getRandomSeed(uint256 tokenId, string memory seedFor) private view returns (string memory) {
      return string(abi.encodePacked(seedFor, Strings.toString(tokenId), block.timestamp, block.difficulty));
    }

    // Return random number between min and max based on seed
    function _getRandomNumber(string memory seed, uint min, uint max) private view returns (uint) {
      uint num = uint(keccak256(abi.encodePacked(seed, block.difficulty, block.timestamp))) % max;
      return num >= min ? num : min;
    }

    // Create a work and set attributes for all editions on it
    function _create(uint tokenId) private {

        // Choose a palette
        uint paletteIndex = _getRandomNumber(_getRandomSeed(tokenId, 'palette'), 1, _palette_count);
        string[] memory palette = _palettes[paletteIndex]; // Save palette in memory to save gas
        
        // Set attributes
        uint index;
        uint colorPicker;

        string[7] memory colors;
        uint[7] memory X;
        uint[7] memory Y;
        uint[7] memory R;

        while(index < MAX_EDITIONS){
          
          //console.log(index);

          colorPicker = _getRandomNumber(_getRandomSeed(tokenId+index, 'color'), 0, 6);
          //console.log('Color', palette[colorPicker]);

          colors[index] = palette[colorPicker];
          X[index] = _getRandomNumber(_getRandomSeed(tokenId+index, 'X'), 10, 90);
          Y[index] = _getRandomNumber(_getRandomSeed(tokenId+index, 'Y'), 10, 90);
          R[index] = _getRandomNumber(_getRandomSeed(tokenId+index, 'R'), 5, 70);

          index++;

        }
        
        Work memory work = Work(colors, X, Y, R);
        _works[tokenId] = work;
        
        emit Create(tokenId, work);

    }

    function getAvailable() public view returns (uint){
      return (_released - _minted);
    }

    function getCreated() public view returns (uint){
      return _created;
    }

    function getCurrentEdition() public view returns(uint){
      return _editions;
    }

    function releaseEdition() public onlyOwner returns (uint){
      require(_released <= _total, 'Max editions reached');
      _released = _released+MAX_WORKS;
      _editions++;
    }

    function create() public {
      require((_created < MAX_WORKS), "All 77 works have been created");
      _created++;
      _create(_created);
      _mintTo(msg.sender);
      _creators.push(msg.sender);
    }

    function getCreators() public view  returns(address[] memory){
      return _creators;
    }

    function mint() public payable returns (uint) {
      require(msg.value >= _price, "Send more ETH");
      require(_created == MAX_WORKS, "All 77 artworks need to be created before minting editions");
      require(((_released - _minted) > 0 && _editions < 7), "Not available");
      return _mintTo(msg.sender);
    }

    function _mintTo(address to) private returns(uint){
      

      // Increment token ID
      _token_id_tracker.increment();

      // Get the new token ID;
      uint256 tokenId = _token_id_tracker.current();

      if(tokenId == MAX_WORKS){

        /**
        Token ID has reached MAX_WORKS so we reset
        to let next edition mint start from 1
        */

        _token_id_tracker.reset();

      }

      _minted++;
      _mint(to, tokenId, 1, "");
      return tokenId;

    }


    function getSVG(uint256 tokenId, uint iteration) public view returns (string memory){

        // console.log("getSVG", iteration);
        // console.log("Supply", totalSupply(tokenId));

        require(iteration <= totalSupply(tokenId), 'Edition not minted!');

        string[3] memory parts;
        
        string[7] memory colors = _works[tokenId].colors;
        uint[7] memory X = _works[tokenId].X;
        uint[7] memory Y = _works[tokenId].Y;
        uint[7] memory R = _works[tokenId].R;

        uint index;
        string memory elements;
        while(index < iteration){
          elements = string(abi.encodePacked(elements, string(abi.encodePacked('<circle cx="',Strings.toString(X[index]),'%" cy="',Strings.toString(Y[index]),'%" r="',Strings.toString(R[index]),'%" filter="url(#f0)" fill="',colors[index],'"></circle>'))));
          index++;
        }

        uint size = _size;
        string memory view_box_size  = Strings.toString(size);
        string memory blur = Strings.toString(size/(iteration));

        parts[0] = string(abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 ',view_box_size,' ',view_box_size,'"><defs><filter id="f0" width="300%" height="300%" x="-100%" y="-100%"><feGaussianBlur in="SourceGraphic" stdDeviation="',blur,'"/></filter></defs><rect width="100%" height="100%" fill="#fff" />'));
        parts[1] = elements;
        parts[2] = '</svg>';

        string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2]));

        return output;

    }


    function tokenURI(uint256 tokenId) virtual public view returns (string memory) {
        
        // require(_exists(tokenId), "Band does not exist");
        
        string memory output = getSVG(tokenId, totalSupply(tokenId));

        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "#',Strings.toString(tokenId),'", "description": "Participatory ERC1155 contract", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
        output = string(abi.encodePacked('data:application/json;base64,', json));

        return output;

    }


    // Balance
    function setPrice(uint256 newPrice) public onlyOwner {
      _price = newPrice;
    }

    function withdrawAll() public payable onlyOwner {
      require(payable(msg.sender).send(address(this).balance));
    }


    // Overrides

    function _mint(address account, uint256 id, uint256 amount, bytes memory data) internal override (ERC1155, ERC1155Supply) {
        super._mint(account, id, amount, data);
    }

    function _mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) internal override (ERC1155, ERC1155Supply) {
        super._mintBatch(to, ids, amounts, data);
    }

    function _burn(address account, uint256 id, uint256 amount) internal override (ERC1155, ERC1155Supply) {
        super._burn(account, id, amount);
    }

    function _burnBatch(address to, uint256[] memory ids, uint256[] memory amounts) internal override (ERC1155, ERC1155Supply) {
        super._burnBatch(to, ids, amounts);
    }

}
