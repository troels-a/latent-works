// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LTNT is ERC721, Ownable {
    
    struct Param {
        uint _uint;
        address _address;
        string _string;
        bool _bool;
    }

    struct Image {
        uint height;
        uint width;
        string content;
    }

    address[] private _issuers;
    mapping(uint => mapping(address => bool)) private _stamps;
    mapping(uint => Param) private _params;
    mapping(uint => address) private _issuer_for_id;
    uint private _ids;

    modifier onlyIssuer(){
        require(isIssuer(msg.sender), 'ONLY_ISSUER');
        _;
    }

    constructor() ERC721("Latents", "LTNT"){}

    /// @notice projects can mint a LTNT token to an address
    function issueTo(address to_, Param memory param_) public onlyIssuer {
        _ids++;
        _safeMint(to_, _ids);
        _stamp(_ids, msg.sender, param_);
        _issuer_for_id[_ids] = msg.sender;
    }

    /// @notice projects can stamp a given token
    function stamp(uint id_, Param memory param_) public onlyIssuer {
        _stamp(id_, msg.sender, param_);
    }

    /// @notice get the stamps for a given LTNT
    function stamps(uint id_) public view returns(address[] memory){
        
        uint count;
        
        for(uint i = 0; i < _issuers.length; i++){
            if(_stamps[id_][_issuers[i]])
                ++count;
        }

        address[] memory stamps_ = new address[](count);
        count = 0;
        for(uint i = 0; i < _issuers.length; i++){
            if(_stamps[id_][_issuers[i]]){
                stamps_[count] = _issuers[i];
                ++count;
            }
        }

        return stamps_;

    }

    function _stamp(uint id_, address project_, Param memory param_) private {
        _stamps[id_][project_] = true;
        _params[_ids] = param_;
    }

    /// @notice make address an LW project
    function addIssuer(address address_) public onlyOwner {
        _issuers.push(address_);
    }

    /// @notice determine if an address is a LW project
    function isIssuer(address address_) public view returns(bool){
        for(uint i = 0; i < _issuers.length; i++) {
            if(_issuers[i] == address_)
                return true;
        }
        return false;
    }

    /// @notice return image string for id_
    function image(uint id_, bool encode_) public view returns(string memory image_){

        bytes memory stamps_;
        for(uint i = 0; i < _issuers.length; i++) {
            if(_stamps[id_][_issuers[i]])
                stamps_ = abi.encodePacked(stamps_, _issuers[i]);
        }

        Image memory LTNTimage_ = LTNTIssuer(_issuer_for_id[id_]).LTNTImage(id_, _params[id_]);

        image_ = string(abi.encode(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ',LTNTimage_.width, ' ', LTNTimage_.height, '" preserveAspectRatio="xMinYMin meet">',
            LTNTimage_.content,
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


abstract contract LTNTIssuer {

    function LTNTImage(uint id_, LTNT.Param memory param_) external virtual view returns(LTNT.Image memory);
    
}