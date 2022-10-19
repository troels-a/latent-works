// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import './LTNT.sol';



contract LTNT_Meta_v2 {

    LTNT public immutable _ltnt;

    ///@dev latent fonts
    XanhMonoRegularLatin public immutable _xanh_regular;
    XanhMonoItalicLatin public immutable _xanh_italic;

    constructor(address ltnt_, address regular_, address italic_){

        _ltnt = LTNT(ltnt_);
        _xanh_regular = XanhMonoRegularLatin(regular_);
        _xanh_italic = XanhMonoItalicLatin(italic_);

    }

    /// @notice return image string for id_
    /// @param id_ the id of the LTNT to retrieve the image for
    /// @param encode_ encode output as base64 uri
    /// @return string the image string
    function getImage(uint id_, bool encode_) public view returns(string memory){

        LTNT.Issuer memory issuer_for_id_ = _ltnt.getIssuerFor(id_);
        LTNT.IssuerInfo memory issuer_info_ = LTNTIssuer(issuer_for_id_.location).issuerInfo(id_, issuer_for_id_.param);
        LTNT.IssuerInfo memory stamper_;
        LTNT.Param memory stamp_param_;
        address[] memory issuers_ = _ltnt.getIssuers();

        bytes memory stamps_svg_;
        string memory delay_;
        uint stamp_count_;
        bool has_stamp_;

        for(uint i = 0; i < issuers_.length; i++) {

            delay_ = Strings.toString(i*150);
            stamp_param_ = _ltnt.getStampParams(id_,issuers_[i]);
            stamper_ = LTNTIssuer(issuers_[i]).issuerInfo(id_, stamp_param_);
            has_stamp_ = _ltnt.hasStamp(id_, issuers_[i]);

            stamps_svg_ = abi.encodePacked(stamps_svg_, '<text class="txt italic" fill-opacity="0" y="',Strings.toString(25*i),'">',stamper_.name,' <animate attributeName="fill-opacity" values="0;',has_stamp_ ? '1' : '0.4','" dur="500ms" repeatCount="1" begin="',delay_,'ms" fill="freeze"/></text>');
            if(has_stamp_)
                ++stamp_count_;

        }

        bytes memory image_;
        image_ = abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1000" preserveAspectRatio="xMinYMin meet">',
                '<defs><style>', _xanh_regular.fontFace(), _xanh_italic.fontFace(),' .txt {font-family: "Xanh Mono"; font-size:20px; font-weight: normal; letter-spacing: 0.01em; fill: white;} .italic {font-style: italic;} .large {font-size: 55px;} .small {font-size: 12px;}</style><rect ry="30" rx="30" id="bg" height="1000" width="600" fill="black"/></defs>',
                '<use href="#bg"/>',
                '<g transform="translate(65, 980) rotate(-90)">',
                    '<text class="txt large italic">Latent Works</text>',
                '</g>',
                '<g transform="translate(537, 21) rotate(90)">',
                    '<text class="txt large italic">LTNT #',Strings.toString(id_),'</text>',
                '</g>',
                '<g transform="translate(517, 22) rotate(90)">',
                    '<text class="txt small">Issued by ',issuer_info_.name,unicode' · ', Strings.toString(stamp_count_) , stamp_count_ > 1 ? ' stamps' : ' stamp', '</text>',
                '</g>'
                '<g transform="translate(25, 25)">',
                    '<image width="300" href="', issuer_info_.image, '"/>',
                '</g>',
                '<g transform="translate(343, 41)">',
                    stamps_svg_,
                '</g>',
                '<g transform="translate(509, 980)">',
                    '<text class="txt small">latent.works</text>',
                '</g>',
            '</svg>'
        );

        if(encode_)
            image_ = abi.encodePacked('data:image/svg+xml;base64,', Base64.encode(image_));

        return string(image_);

    }


    /// @notice return base64 encoded JSON metadata for id_
    /// @param id_ the id of the LTNT to retrieve the image for
    /// @param encode_ encode output as base64 uri
    /// @return string the image string
    function getJSON(uint id_, bool encode_) public view returns(string memory) {
        
        LTNT.Issuer memory issuer_for_id_ = _ltnt.getIssuerFor(id_);
        LTNT.IssuerInfo memory issuer_info_ = LTNTIssuer(issuer_for_id_.location).issuerInfo(id_, issuer_for_id_.param);

        bytes memory json_ = abi.encodePacked(
            '{',
                '"name":"LTNT #',Strings.toString(id_),'", ',
                '"image": "', getImage(id_, true),'", ',
                '"description": "latent.works",',
                '"attributes": [',
                    '{"trait_type": "Stamps", "value": ',Strings.toString(_ltnt.getStamps(id_).length),'},',
                    '{"trait_type": "Issuer", "value": "', issuer_info_.name, '"}',
                ']',
            '}'
        );

        if(encode_)
            json_ = abi.encodePacked('data:application/json;base64,', Base64.encode(json_));
        
        return string(json_);

    }


}
