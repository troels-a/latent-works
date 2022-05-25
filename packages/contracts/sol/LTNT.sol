// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./LTNTFont.sol";


//////////////////////////////////
//
//
// LTNT
//
//
//////////////////////////////////


/// @title LTNT
/// @author Troels Abrahamsen
/// @notice Handles the creation and issuance of LTNT tokens used in the Latent Works project
/// @dev Allows the owner to register issuers that can mint new LTNT tokens to addresses

contract LTNT is ERC721, Ownable {
    
    struct Param {
        uint _uint;
        address _address;
        string _string;
        bool _bool;
    }

    struct IssuerInfo {
        string name;
        string image;
    }

    ///@dev latent fonts
    XanhMonoRegularLatin private _xanh_regular;
    XanhMonoItalicLatin private _xanh_italic;

    address[] private _issuers; ///@dev array of addresses registered as issuers
    mapping(uint => mapping(address => bool)) private _stamps; ///@dev (ltnt => (issuer => is stamped?))
    mapping(uint => mapping(address => Param)) private _params; ///@dev (ltnt => (issuer => stamp parameters));
    mapping(uint => address) private _issuer_for_id; ///@dev (ltnt => issuer) - the address of the issuer for a given LTNT
    mapping(uint => Param) private _params_for_issuer; ///@dev (ltnt => issuer parameters) - parameters for issuer of a given LTNT
    
    uint private _ids; ///@dev LTNT _id counter


    /// @dev pass address of onchain fonts to the constructor
    constructor(address xanh_regular_, address xanh_italic_) ERC721("Latents", "LTNT"){
        _xanh_regular = XanhMonoRegularLatin(xanh_regular_);
        _xanh_italic = XanhMonoItalicLatin(xanh_italic_);
    }


    /// @notice Check if a given address is a registered issuer
    /// @param caller_ the address to check for issuer privilegies
    function _reqOnlyIssuer(address caller_) private view {
        require(isIssuer(caller_), 'ONLY_ISSUER');
    }

    /// @notice Issue a token to the address
    /// @param to_ the address to issue the LTNT to
    /// @param param_ a Param struct of parameters associated with the token
    /// @param stamp_ boolean determining wether the newly issued LTNT should be stamped by the issuer
    /// @return uint the id of the newly issued LTNT
    function issueTo(address to_, Param memory param_, bool stamp_) public returns(uint){
        _reqOnlyIssuer(msg.sender);
        _ids++;
        _safeMint(to_, _ids);
        if(stamp_)
            _stamp(_ids, msg.sender, param_);
        _issuer_for_id[_ids] = msg.sender;
        _params_for_issuer[_ids] = param_;
        return _ids;
    }


    /// @dev Lets a registered issuer stamp a given LTNT
    /// @param id_ the ID of the LTNT to stamp
    /// @param param_ a Param struct with any associated params
    function stamp(uint id_, Param memory param_) public {
        _reqOnlyIssuer(msg.sender);
        _stamp(id_, msg.sender, param_);
    }

    /// @dev internal stamping mechanism
    /// @param id_ the id of the LTNT to stamp
    /// @param issuer_ the address of the issuer stamping the LTNT
    /// @param param_ a Param struct with stamp parameters
    function _stamp(uint id_, address issuer_, Param memory param_) private {
        _stamps[id_][issuer_] = true;
        _params[id_][issuer_] = param_;
    }


    /// @dev Get the addresses of the issuers that have stamped a given LTNT
    /// @param id_ the ID of the LTNT to fetch stamps for
    /// @return address[] an array of issuer addresses that have stamped the LTNT
    function stamps(uint id_) public view returns(address[] memory){
        
        // First count the stamps
        uint count;
        for(uint i = 0; i < _issuers.length; i++){
            if(_stamps[id_][_issuers[i]])
                ++count;
        }

        // Init a stamps_ array with the right length from count_
        address[] memory stamps_ = new address[](count);

        // Loop over the issuers and save stampers in stamps_
        count = 0;
        for(uint i = 0; i < _issuers.length; i++){
            if(_stamps[id_][_issuers[i]]){
                stamps_[count] = _issuers[i];
                ++count;
            }
        }

        return stamps_;

    }


    /// @notice register an issuer address
    /// @param address_ the address of the issuer to add
    function addIssuer(address address_) public onlyOwner {
        _issuers.push(address_);
    }

    /// @notice determine if an address is a LW project
    /// @param address_ the address of the issuer
    /// @return bool indicating wet
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
        LTNT.IssuerInfo memory ltnt_;

        IssuerInfo memory issuer_ = LTNTIssuer(_issuer_for_id[id_]).issuerInfo(id_, _params_for_issuer[id_]);
        string memory delay_;
        uint stamp_count_;
        for(uint i = 0; i < _issuers.length; i++) {
            delay_ = Strings.toString(i*150);
            if(_stamps[id_][_issuers[i]]){
                ltnt_ = LTNTIssuer(_issuers[i]).issuerInfo(id_, _params[id_][_issuers[i]]);
                stamps_ = abi.encodePacked(stamps_, '<text class="txt italic" fill-opacity="0" fill="white" y="',Strings.toString(25*i),'">',ltnt_.name,' <animate attributeName="fill-opacity" values="0;1" dur="500ms" repeatCount="1" begin="',delay_,'ms" fill="freeze"/></text>');
                ++stamp_count_;
            }
            else {
                ltnt_ = LTNTIssuer(_issuers[i]).issuerInfo(id_, _params[id_][_issuers[i]]);
                stamps_ = abi.encodePacked(stamps_, '<text class="txt italic" fill-opacity="0" fill="#666" y="',Strings.toString(25*i),'">',ltnt_.name,' <animate attributeName="fill-opacity" values="0;1" dur="500ms" repeatCount="1" begin="',delay_,'ms" fill="freeze"/></text>');
            }
        }

        image_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1000" preserveAspectRatio="xMinYMin meet">',
                '<defs><style>',_xanh_regular.fontFace(),_xanh_italic.fontFace(),'.txt {font-family: "Xanh Mono"; font-size:20px; font-weight: normal; letter-spacing: 0.01em;} .italic {font-style: italic;} .large {font-size: 55px;} .small {font-size: 12px;}</style><rect id="bg" height="1000" width="750" fill="black"/></defs>',
                '<use href="#bg"/>',
                '<g transform="translate(65, 980) rotate(-90)">',
                    '<text class="txt large italic" fill="white">Latent Works</text>',
                '</g>',
                '<g transform="translate(687, 21) rotate(90)">',
                    '<text class="txt large italic" fill="white">LTNT #',Strings.toString(id_),'</text>',
                '</g>',
                '<g transform="translate(667, 22) rotate(90)">',
                    '<text class="txt small" fill="white">Issued by ',issuer_.name,unicode' · ', Strings.toString(stamp_count_) , stamp_count_ > 1 ? ' stamps' : ' stamp', '</text>',
                '</g>'
                '<g transform="translate(25, 25)">',
                    '<image width="350" href="', issuer_.image, '"/>',
                '</g>',
                '<g transform="translate(393, 41)">',
                    stamps_,
                '</g>',
                '<g transform="translate(659, 980)">',
                    '<text class="txt small" fill="white">latent.works</text>',
                '</g>'
            '</svg>'
        );

        if(encode_)
            image_ = abi.encodePacked('data:image/svg+xml;base69,', image_);

        return string(image_);

    }

    /// @notice return JSON for id_
    function tokenURI(uint id_) public view override returns(string memory json_){
        json_ = string(abi.encodePacked(
        '{',
            '"name":"LTNT", ',
            '"image": "', getImage(id_, true),'", ',
            '"description": "latent.works"'
        '}'));
    }


}


abstract contract LTNTIssuer {

    function issuerInfo(uint id_, LTNT.Param memory param_) external virtual view returns(LTNT.IssuerInfo memory);
    
}