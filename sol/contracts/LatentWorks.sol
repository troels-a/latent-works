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

////////////
LATENT WORKS
////////////


author: Troels Abrahamsen
year: 2021
type: in-chain
description: 77 tokens advancing through 7 possible editions, each affecting the resulting artwork when minted.

*/

contract LatentWorks is ERC1155, ERC1155Supply, Ownable {

    // Tokens
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDTracker;
    uint private _maxTokens = 7;
    uint private _waitTime = (60*60*7);

    // Atttributes
    struct Attributes {
        uint cap;
        string[7] colors;
        uint[7] X;
        uint[7] Y;
        uint[7] R;
    }
    mapping(uint256 => Attributes) private _attributes;
    event Create(uint256 id, Attributes);

    // Canvas
    uint private _size = 500;
    uint private _palette_count = 3;
    mapping(uint256 => string[]) private _palettes;

    constructor(address[] memory initialMint) ERC1155("") {

      _palettes[1] = ["#82968c","#6a706e","#ffd447","#ff5714","#170312","#0cf574","#f9b4ed"];
      _palettes[2] = ["#f59ca9","#775253","#01fdf6","#cff27e","#294d4a","#0cf574","#0e103d"];
      _palettes[3] = ['rgba(90, 232, 89, 0.706)', 'rgba(255, 98, 98, 0.706)', 'rgba(79, 42, 109, 0.706)', 'rgba(0, 255, 208, 0.769)', 'pink', '#888', 'black'];

      for (uint256 index = 0; index < initialMint.length; index++) {
        _createForAddress(initialMint[index]);
      }

    }

    function _getRandomSeed(uint256 tokenId, string memory seedFor) private view returns (string memory) {
      return string(abi.encodePacked(seedFor, Strings.toString(tokenId), block.timestamp, block.difficulty));
    }

    function _getRandomNumber(string memory seed, uint min, uint max) private view returns (uint) {
      uint num = uint(keccak256(abi.encodePacked(seed, block.difficulty, block.timestamp))) % max;
      return num >= min ? num : min;
    }

    function create() public onlyOwner {
      _createForAddress(msg.sender);
    }


    function _createForAddress(address addr) private returns(uint256) {
        
        require((_tokenIDTracker.current() <= _maxTokens), 'Max tokens created');

        // Increment token ID
        _tokenIDTracker.increment();

        // Get the new token ID;
        uint256 tokenId = _tokenIDTracker.current();

        //console.log("Create one latent", tokenId);

        // Choose a palette
        uint paletteIndex = _getRandomNumber(_getRandomSeed(tokenId, 'palette'), 1, _palette_count);
        string[] memory palette = _palettes[paletteIndex]; // Save palette in memory to save gas
        //console.log("Palette", paletteIndex);

        // Set the available tokens that can be minted
        uint cap = 7; //_getRandomNumber(_getRandomSeed(tokenId, 'cap'), 3, 7);
        
        //console.log("Cap", cap);

        // Set attributes
        uint index;
        uint colorPicker;

        string[7] memory colors;
        uint[7] memory X;
        uint[7] memory Y;
        uint[7] memory R;

        while(index < cap){
          
          //console.log(index);

          colorPicker = _getRandomNumber(_getRandomSeed(tokenId+index, 'color'), 0, 6);
          //console.log('Color', palette[colorPicker]);

          colors[index] = palette[colorPicker];
          X[index] = _getRandomNumber(_getRandomSeed(tokenId+index, 'X'), 10, 90);
          Y[index] = _getRandomNumber(_getRandomSeed(tokenId+index, 'Y'), 10, 90);
          R[index] = _getRandomNumber(_getRandomSeed(tokenId+index, 'R'), 5, 70);

          index++;

        }
        
        Attributes memory attrs = Attributes(cap, colors, X, Y, R);
        _attributes[tokenId] = attrs;
        
        emit Create(tokenId, attrs);

        _mintForAddress(tokenId, addr);
        
        return tokenId;

    }

    function getCreated() public view returns (uint){
      return _tokenIDTracker.current();
    }

    function getAvailableToMint(uint256 tokenId) public view returns (uint256) {
        return getCapForID(tokenId) - totalSupply(tokenId);
    }

    function getCapForID(uint256 tokenId) public view returns (uint256){
        return _attributes[tokenId].cap;
    }


    function mint(uint256 tokenId) public {
      return _mintForAddress(tokenId, msg.sender);
    }


    function _mintForAddress(uint256 tokenId, address addr) private {

        console.log("");
        
        // console.log("Try mint of tokentokenId:", id);
        require(getAvailableToMint(tokenId) > 0, "Not available!");


        _mint(addr, tokenId, 1, "");
        // console.log("Minted! Remaining:", getAvailableToMint(id));

    }


    function getSVG(uint256 tokenId, uint iteration) public view returns (string memory){

        // console.log("getSVG", iteration);
        // console.log("Supply", totalSupply(tokenId));

        require(iteration <= totalSupply(tokenId), 'Edition not minted!');

        string[3] memory parts;
        string memory tokenString = Strings.toString(tokenId);
        
        uint cap = _attributes[tokenId].cap;
        string[7] memory colors = _attributes[tokenId].colors;
        uint[7] memory X = _attributes[tokenId].X;
        uint[7] memory Y = _attributes[tokenId].Y;
        uint[7] memory R = _attributes[tokenId].R;

        uint index;
        string memory elements;
        while(index < iteration){
          elements = string(abi.encodePacked(elements, string(abi.encodePacked('<circle cx="',Strings.toString(X[index]),'%" cy="',Strings.toString(Y[index]),'%" r="',Strings.toString(R[index]),'%" filter="url(#f0)" fill="',colors[index],'"></circle>'))));
          index++;
        }

        // Save size here and make three strings with 100%, 10% and 1% size for use in SVG
        uint size = _size;
        string memory size_100  = Strings.toString(size);
        string memory blur = Strings.toString(size/(iteration));
        // string memory size_50   = Strings.toString((size/2));
        // string memory size_25   = Strings.toString((size/4));
        // string memory size_10   = Strings.toString((size/10));

        parts[0] = string(abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 ',size_100,' ',size_100,'"><defs><filter id="f0" width="300%" height="300%" x="-100%" y="-100%"><feGaussianBlur in="SourceGraphic" stdDeviation="',blur,'"/></filter></defs><rect width="100%" height="100%" fill="#fff" />'));
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
