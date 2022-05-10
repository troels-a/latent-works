// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LTNT is ERC721, Ownable {
    
    address[] private _projects;
    mapping(uint => mapping(address => bool)) private _stamps;
    uint private _ids;

    modifier onlyProject(){
        require(isProject(msg.sender), 'ONLY_PROJECT');
        _;
    }

    constructor() ERC721("Latent Works", "LTNT") {

    }

    /// @notice projects can mint a LTNT token to an address
    function mint(address to_, uint id_) public onlyProject {
        LTNTProject _project = LTNTProject(msg.sender);
        _ids++;
        _safeMint(to_, _ids);
    }

    /// @notice projects can stamp a given token
    function stamp(uint id_) public onlyProject {
        _stamps[id_][msg.sender] = true;
    }

    /// @notice make address an LW project
    function addProject(address address_) public onlyOwner {
        _projects.push(address_);
    }

    /// @notice determine if an address is a LW project
    function isProject(address address_) public view returns(bool){
        for(uint i = 0; i < _projects.length; i++) {
            if(_projects[i] == address_)
                return true;
        }
        return false;
    }

    /// @notice return image string for id_
    function image(uint id_, bool encode_) public view returns(string memory image_){

        bytes memory stamps_;
        for(uint i = 0; i < _projects.length; i++) {
            if(_stamps[id_][_projects[i]])
                stamps_ = abi.encodePacked(stamps_, '<stamp/>');
        }

        image_ = string(abi.encode(
            '<svg>',
            stamps_,
            '</svg>'
        ));

        if(encode_)
            image_ = string(abi.encodePacked('data:image/svg+xml;base69,', image_));

        return image_;

    }

    /// @notice return JSON for id_
    function tokenURI(uint id_) public view override returns(string memory json_){
        json_ = string(abi.encodePacked('{"name":"Latent Works (LTNT)", "image": "',image(id_, true),'"}'));
    }


}


abstract contract LTNTProject {

    function info() external virtual returns(string memory);
    
}