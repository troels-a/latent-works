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
                                                      

Troels Abrahamsen, 2021
troelsabrahamsen.eth

*/

contract LatentWorks is ERC1155, ERC1155Supply, Ownable {

    // Constants
    string public constant NAME = "Latent Works";
    string public constant DESCRIPTION = "Determined by code, brought to being by people";
    uint public constant MAX_WORKS = 77;
    uint public constant MAX_EDITIONS = 7;

    // Works
    using Counters for Counters.Counter;
    Counters.Counter private _token_id_tracker;
    uint private _released = 0;
    uint private _editions = 0;
    uint private _minted = 0;
    uint private _total = MAX_WORKS*MAX_EDITIONS;
    uint private _price = 0.07 ether;
    mapping(uint => string) private _seeds;
    mapping(uint => mapping(uint => address)) private _minters;
    mapping(address => bool) private _has_minted;

    // Canvas
    uint private _size = 777;
    uint private _palette_count = 3;
    mapping(uint256 => string[]) private _palettes;

    constructor() ERC1155("") {

      _palettes[1] = ["#82968c","#6a706e","#ffd447","#ff5714","#170312","#0cf574","#f9b4ed"];
      _palettes[2] = ["#f59ca9","#775253","#01fdf6","#cff27e","#294d4a","#0cf574","#0e103d"];
      _palettes[3] = ['rgba(90, 232, 89, 0.706)', 'rgba(255, 98, 98, 0.706)', 'rgba(79, 42, 109, 0.706)', 'rgba(0, 255, 208, 0.769)', 'pink', '#888', 'black'];

    }

    function _getRandomNumber(string memory seed, uint min, uint max) private pure returns (uint) {
      uint num = uint(keccak256(abi.encode(seed))) % max;
      return num >= min ? num : min;
    }

    function getAvailable() public view returns (uint){
      return (_released - _minted);
    }

    function getMinted() public view returns (uint){
      return _minted;
    }

    function getEditions() public view returns(uint){
      return _editions;
    }

    function getCurrentEdition() public view returns(uint){
      return ((_minted/10)/MAX_EDITIONS)+1;
    }
    
    function getMinter(uint token_id, uint edition) public view returns(address){
      return _minters[token_id][edition];
    }

    function _getPalette(uint token_id) private view returns(uint){
      require(exists(token_id), "Work does not exist");
      string memory token_seed = _seeds[token_id];
      return _getRandomNumber(string(abi.encodePacked(token_seed, 'P')), 1, _palette_count);
    }

    function releaseEdition() public onlyOwner {
      require(_released <= _total, 'Max editions reached');
      _released = _released+MAX_WORKS;
      _editions++;
    }

    function mint() public payable returns (uint) {
      require(msg.value >= _price, "Send more ETH");
      require((getAvailable() > 0), "Not available");
      return _mintTo(msg.sender);
    }

    function _mintTo(address to) private returns(uint){
      
      _token_id_tracker.increment();

      uint256 token_id = _token_id_tracker.current();
      uint edition = getCurrentEdition();

      if(edition == 1){
        _seeds[token_id] = string(abi.encodePacked(Strings.toString(token_id), block.timestamp, block.difficulty));
      }

      if(token_id == MAX_WORKS){
        _token_id_tracker.reset();
      }

      _mint(to, token_id, 1, "");
      _minted++;

      _minters[token_id][edition] = to;

      return token_id;

    }


    function _getElement(string memory token_seed, uint edition, uint palette, string memory filter) private view returns(string memory){
      
      string memory svgSeed = string(abi.encodePacked(token_seed, Strings.toString(edition)));
      string memory C = _palettes[palette][_getRandomNumber(string(abi.encodePacked(svgSeed, 'C')), 1, 7)];
      uint X = _getRandomNumber(string(abi.encodePacked(svgSeed, 'X')), 10, 90);
      uint Y = _getRandomNumber(string(abi.encodePacked(svgSeed, 'Y')), 10, 90);
      uint R = _getRandomNumber(string(abi.encodePacked(svgSeed, 'R')), 5, 70);

      return string(abi.encodePacked('<circle cx="',Strings.toString(X),'%" cy="',Strings.toString(Y),'%" r="',Strings.toString(R),'%" filter="url(#',filter,')" fill="',C,'"></circle>'));

    }


    function getSVG(uint256 token_id, uint edition) public view returns (string memory){

        require(edition <= totalSupply(token_id), 'Edition not minted');

        string[3] memory parts;

        uint index;
        string memory token_seed = _seeds[token_id];
        uint palette = _getRandomNumber(string(abi.encodePacked(token_seed, 'P')), 1, _palette_count);
        // string memory svgSeed;

        string memory elements = string(abi.encodePacked(_getElement(token_seed, 70, palette, "f1"), _getElement(token_seed, 700, palette, "f1")));

        while(index < edition){
          elements = string(abi.encodePacked(elements, _getElement(token_seed, index, palette, "f0")));
          index++;
        }

        uint size = _size;
        string memory view_box_size = Strings.toString(size);
        string memory blur = Strings.toString(size/(edition));

        parts[0] = string(abi.encodePacked('<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 ',view_box_size,' ',view_box_size,'"><defs><filter id="f0" width="300%" height="300%" x="-100%" y="-100%"><feGaussianBlur in="SourceGraphic" stdDeviation="',blur,'"/></filter><filter id="f1" width="300%" height="300%" x="-100%" y="-100%"><feGaussianBlur in="SourceGraphic" stdDeviation="700"/></filter></defs><rect width="100%" height="100%" fill="#fff" />'));
        parts[1] = elements;
        parts[2] = '</svg>';

        string memory output = string(abi.encodePacked('data:image/svg+xml;base64,', Base64.encode(bytes(string(abi.encodePacked(parts[0], parts[1], parts[2]))))));

        return output;

    }

    function uri(uint256 token_id) virtual public view override returns (string memory) {
        
        require(exists(token_id), 'INVALID_ID');

        string memory svg = getSVG(token_id, totalSupply(token_id));
        string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "', NAME,' #',Strings.toString(token_id),'", "description": "',DESCRIPTION,'", "image": "', svg, '"}'))));

        return string(abi.encodePacked('data:application/json;base64,', json));

    }

    function withdrawAll() public payable onlyOwner {
      require(payable(msg.sender).send(address(this).balance));
    }


    // Required overrides
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
