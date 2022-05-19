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

    struct Info {
        string name;
        uint width;
        bytes content;
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
    function issueTo(address to_, Param memory param_, bool stamp_) public onlyIssuer {
        _ids++;
        _safeMint(to_, _ids);
        if(stamp_)
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
        _params[id_] = param_;
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
    function getImage(uint id_, bool encode_) public view returns(string memory){

        bytes memory stamps_;
        bytes memory image_;
        LTNT.Info memory ltnt_;

        Info memory LTNTInfo = LTNTIssuer(_issuer_for_id[id_]).LTNTInfo(id_, _params[id_]);
        string memory delay_;
        for(uint i = 0; i < _issuers.length; i++) {
            delay_ = Strings.toString(i*250);
            if(_stamps[id_][_issuers[i]]){
                ltnt_ = LTNTIssuer(_issuers[i]).LTNTInfo(id_, _params[id_]);
                stamps_ = abi.encodePacked(stamps_, '<rect fill-opacity="0" width="0" height="23" y="',Strings.toString(50+(i*23)),'" x="',Strings.toString(LTNTInfo.width+10),'" fill="black"><animate attributeName="width" values="0;280" dur="300ms" repeatCount="1" begin="',delay_,'ms" fill="freeze"/><animate attributeName="fill-opacity" values="0;1" dur="300ms" repeatCount="1" begin="',delay_,'ms" fill="freeze"/></rect><text class="txt" fill-opacity="0" fill="white" x="',Strings.toString(LTNTInfo.width+20),'" y="',Strings.toString(65+(23*i)),'">',ltnt_.name,' <animate attributeName="fill-opacity" values="0;1" dur="1s" repeatCount="1" begin="',delay_,'ms" fill="freeze"/></text>');
            }
            else {
                ltnt_ = LTNTIssuer(_issuers[i]).LTNTInfo(id_, _params[id_]);
                stamps_ = abi.encodePacked(stamps_, '<rect fill-opacity="0" width="0" height="23" y="',Strings.toString(50+(i*23)),'" x="',Strings.toString(LTNTInfo.width+10),'" fill="#ececec"><animate attributeName="width" values="0;280" dur="300ms" repeatCount="1" begin="',delay_,'ms" fill="freeze"/><animate attributeName="fill-opacity" values="0;1" dur="300ms" repeatCount="1" begin="',delay_,'ms" fill="freeze"/></rect><text class="txt" fill-opacity="0" fill="grey" x="',Strings.toString(LTNTInfo.width+20),'" y="',Strings.toString(65+(23*i)),'">',ltnt_.name,' <animate attributeName="fill-opacity" values="0;1" dur="1s" repeatCount="1" begin="',delay_,'ms" fill="freeze"/></text>');
            }
        }

        image_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ',Strings.toString(LTNTInfo.width+300), ' 1000" preserveAspectRatio="xMinYMin meet">',
            '<defs><style>.txt {font-family: monospace, monospace; font-size:12px; font-weight: normal; letter-spacing: 0.01em;} .head {font-size: 20px; font-style: italic;}</style><rect id="bg" height="1000" width="',Strings.toString(LTNTInfo.width+300),'" fill="white"/></defs><use href="#bg"/><text class="txt head" x="',Strings.toString(LTNTInfo.width+10),'" y="30" fill="black">Latent Works</text>',
            LTNTInfo.content,
            stamps_,
            '</svg>'
        );

        if(encode_)
            image_ = abi.encodePacked('data:image/svg+xml;base69,', image_);

        return string(image_);

    }

    /// @notice return JSON for id_
    function tokenURI(uint id_) public view override returns(string memory json_){
        json_ = string(abi.encodePacked('{"name":"Latent Works (LTNT)", "image": "', getImage(id_, true),'"}'));
    }


}


abstract contract LTNTIssuer {

    function LTNTInfo(uint id_, LTNT.Param memory param_) external virtual view returns(LTNT.Info memory);
    
}