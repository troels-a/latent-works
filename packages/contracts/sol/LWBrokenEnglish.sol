// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import './LTNT.sol';
import './lib/Rando.sol';

contract LWBrokenEnglish is LTNTIssuer, Ownable, ERC721 {


    struct Line {
        string content;
        uint mint_block;
        uint rate;
    }

    /// @dev _lines added
    mapping(uint => Line) private _lines;
    uint private _line_count;

    /// @dev claimed LTNTs for ids
    mapping(uint => bool) private _claimed;

    /// @dev token IDs
    uint private _ids;
    /// @dev price;
    uint public constant PRICE = 0.03 ether;

    /// @dev ltnt issuing contract
    LTNT public immutable _ltnt;
    XanhMonoRegularLatin public immutable _regular;
    XanhMonoItalicLatin public immutable _italic;


    constructor(address ltnt_address_, address regular_, address italic_) ERC721('Broken English', 'BRKN'){
        _ltnt = LTNT(ltnt_address_);
        _regular = XanhMonoRegularLatin(regular_);
        _italic = XanhMonoItalicLatin(italic_);
        /// TODO: Set random max lines 500-1000 on construct based on timestamp
    }

    /// @dev issuer info for LTNT contracts
    function issuerInfo(uint id_, LTNT.Param memory param_) public view override returns(LTNT.IssuerInfo memory){
        return LTNT.IssuerInfo('Broken English', getImage(param_._uint, true));
    }

    /// @dev add line to contract
    function addLines(string[] memory lines_) public onlyOwner {
        
        for (uint256 i = 0; i < lines_.length; i++) {
            _line_count++;
            _lines[_line_count] = Line(
                lines_[i],
                0,
                Rando.number(lines_[i], 10, 1000)
            );
        }
      
    }

    /// @dev mint and stamp ltnt_id_ or issue new one if 0
    function mint(uint line_) public payable {
        
        require(!_exists(line_), 'LINE_MINTED');
        require(msg.value == PRICE, 'INVALID_PRICE');

        _safeMint(msg.sender, line_);
        _lines[line_-1].mint_block = block.number;
        
    }

    function claimLTNT(uint id_) public {
        require(_claimed[id_], 'ALREADY_CLAIMED');
        require(ownerOf(id_) == msg.sender, 'NOT_LINE_OWNER');
        _ltnt.issueTo(msg.sender, LTNT.Param(id_, address(0), '', false), true);
        _claimed[id_] = true;
    }

    function stampLTNT(uint id_, uint ltnt_id_) public {
        require(ownerOf(id_) == msg.sender, 'NOT_LINE_OWNER');
        require(_ltnt.ownerOf(ltnt_id_) == msg.sender, 'NOT_LTNT_OWNER');
        _ltnt.stamp(ltnt_id_, LTNT.Param(id_, address(0), '', false));
    }

    /// @dev line count
    function getLineCount() public view returns(uint){
        return _line_count;
    }

    /// @dev get line for id
    function getLine(uint id_) public view returns(Line memory){
        return _lines[id_];
    }

    /// @dev get degrade value
    function getLineDegradation(uint id_) public view returns(uint){
        if(_lines[id_].mint_block > 0)
            return block.number - _lines[id_].mint_block;
        return 0;
    }

    /// @dev get the image for a specific line
    function getImage(uint id_, bool encode_) public view returns(string memory){
        
        Line memory line_ = getLine(id_);
        string memory length_ = Strings.toString((bytes(line_.content).length*40)+40);
        uint degrade_ = getLineDegradation(id_);

        bytes memory svg_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 ',length_,'" preserveAspectRatio="xMinYMin meet">',
                '<defs><style>',_regular.fontFace(), _italic.fontFace(),' .txt { font-family: "Xanh Mono", sans-serif; font-size: 80px; fill: white;}</style><rect id="bg" height="120" width="',length_,'" fill="black"/></defs>',
                '<use href="#bg"/>',
                '<g transform="translate(20, 90)">',
                    '<text class="txt">',line_.content,'</text>',
                '</g>',
            '</svg>'
        );

        if(encode_)
            return string(abi.encodePacked('data:image/svg+xml;base64,', Base64.encode(svg_)));

        return string(svg_);

    }


    /// @dev tokenURI
    function tokenURI(uint id_) public view override returns(string memory){
        require(_exists(id_), 'NON-EXISTENT LINE');
        bytes memory json_ = abi.encodePacked(
            '{',
                '"name": "bRokEN eNgLiSH",',
                '"description": "',getLine(id_).content,'",',
                '"image": "',getImage(id_, true),'"',
            '}'
        );

        return Base64.encode(json_);
    }


    /// @dev owner can withdraw
    function withdrawAll() public payable onlyOwner {
      require(payable(msg.sender).send(address(this).balance));
    }

}