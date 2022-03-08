//SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Strings.sol";
import './base64.sol';
import './Rando.sol';

import './../77x7/ILW_77x7.sol';
import './ILW_00x0.sol';


contract Meta_00x0 {

    ILW_00x0 private _00x0;
    ILW_77x7 private _77x7;

    modifier onlyInternal(){
        require((msg.sender == address(_00x0) || msg.sender == address(this)), 'ONLY_INTERNAL');
        _;
    }
    
    string private _easing = 'keyTimes="0; 0.33; 0.66; 1" keySplines="0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1; 0.5 0 0.5 1;"';    
    string private _raster = 'data:@file/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGElEQVQImWNgYGD4BSKYGBgY3jIwMDAAABJxAeqiPewiAAAAAElFTkSuQmCC';
    string private _noise = 'data:@file/png;base64,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';

    constructor(address main_, address genesis_){
        _00x0 = ILW_00x0(main_);
        _77x7 = ILW_77x7(genesis_);
    }

    function getArtwork(uint comp_id_, ILW_00x0.CompInfo memory comp_) public view onlyInternal returns(string memory output_) {

        
        for(uint i = 0; i < comp_.works.length; i++) {
            
            comp_.seed0 = string(abi.encodePacked(comp_.seed, Strings.toString(i)));
            comp_.seed1 = string(abi.encodePacked(comp_.seed, abi.encodePacked(comp_.seed0, 'left')));
            comp_.seed2 = string(abi.encodePacked(comp_.seed, abi.encodePacked(comp_.seed0, 'right')));

            comp_.id_string = Strings.toString(i+1);
            
            comp_.left = Rando.number(comp_.seed1, comp_.last_left/10, 1000); //(i+1 == comp_.works.length) ? 100 : Rando.number(comp_.seed1, comp_.last_left+(min), comp_.last_left+max);
            comp_.right = Rando.number(comp_.seed2, comp_.last_right/2, 1000);//(i+1 == comp_.works.length) ? 100 : Rando.number(comp_.seed2, comp_.last_right+(min), comp_.last_right+max);
            
            comp_.defs = abi.encodePacked(comp_.defs,
            '<clipPath id="clip',comp_.id_string,'"><polygon points="0,',Strings.toString(comp_.last_left),' 0,',Strings.toString(comp_.left),' 1000,',Strings.toString(comp_.right),' 1000,',Strings.toString(comp_.last_right),'">',
            '</polygon></clipPath>');

            
            comp_.elements = abi.encodePacked(comp_.elements,
            '<rect fill="', _77x7.getColor(comp_.works[i], Rando.number(comp_.seed0, 1, 7)),'" y="0" x="0" height="1000" width="1000" clip-path="url(#clip',comp_.id_string,')">',
            '</rect>'
            );

            comp_.begin_t = abi.encodePacked(Strings.toString(Rando.number(comp_.seed1, 100, 700)),' ',Strings.toString(Rando.number(comp_.seed2, 100, 700)));
            comp_.translate = abi.encodePacked(comp_.begin_t, ';', Strings.toString(Rando.number(comp_.seed1, 10, 800)),' ', Strings.toString(Rando.number(comp_.seed2, 10, 800)),';', Strings.toString(Rando.number(comp_.seed2, 100, 1000)),' ', Strings.toString(Rando.number(comp_.seed1, 400, 800)),';',comp_.begin_t);
            comp_.scale = abi.encodePacked('1; 0.', Strings.toString(Rando.number(comp_.seed1, 1, 9)),'; 0.',Strings.toString(Rando.number(comp_.seed2, 1, 9)),'; 1');

            comp_.ani_elements = abi.encodePacked(comp_.ani_elements,
            '<rect fill="', _77x7.getColor(comp_.works[i], Rando.number(comp_.seed0, 1, 7)),'" y="0" x="0" height="1000" width="1000" clip-path="url(#clip',comp_.id_string,')">',
            '<animateTransform ',_easing,' attributeName="transform" type="scale" values="',comp_.scale,'" begin="0s" dur="',Strings.toString(Rando.number(comp_.seed2, 50, 100)),'s" repeatCount="indefinite"/>',
            '</rect>'
            );

            comp_.last_left = comp_.left;
            comp_.last_right = comp_.right;

        }

        comp_.pos[0] = Strings.toString(Rando.number(comp_.seed, 100, comp_.orientation < 50 ? 500 : 800));
        comp_.pos[1] = Strings.toString(Rando.number(comp_.seed1, 100, comp_.orientation < 50 ? 800 : 500));
        
        output_ = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ',comp_.width_string, ' ', comp_.height_string, '" preserveAspectRatio="xMinYMin meet">',
            '<defs>',
            '<pattern id="raster" x="0" y="0" width="2" height="4" patternUnits="userSpaceOnUse"><image opacity="0.5" width="2" height="4" href="',_raster,'"/></pattern>',
            '<pattern id="noise" x="0" y="0" width="51" height="51" patternUnits="userSpaceOnUse"><image opacity="0.2" width="51" height="51" href="',_noise,'"/></pattern>',
            '<g id="main" transform="translate(-5 -5) scale(1.2)" opacity="0.8">',
            comp_.elements,
            '</g>',
            '<g id="main-ani" transform="translate(-5 -5) scale(1.2)" opacity="0.8">',
            comp_.ani_elements,
            '</g>',
            '<filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="100"/></filter>',
            '<rect id="bg" height="1000" width="1000" x="0" y="0"/><clipPath id="clip"><use href="url(#bg)"/></clipPath>',
            comp_.defs,
            '</defs>'
        ));
        
        output_ = string(abi.encodePacked(
            output_,
            '<g clip-path="#clip">',
            '<use href="#bg" fill="white"/>',
            '<use href="#main" filter="url(#blur)" transform="rotate(90, 500, 500)"/>',
            '<use href="#main-ani" filter="url(#blur)" transform="scale(0.',Strings.toString(Rando.number(comp_.seed0, 5, 9)),') rotate(90, 500, 500)"/>',
            '<use href="#main-ani" filter="url(#blur)" transform="scale(0.',Strings.toString(Rando.number(comp_.seed0, 3, 6)),') translate(',comp_.pos[0],', ',comp_.pos[1],')"/>',
            comp_.mark ? _getMark(comp_id_, comp_) : '',
            '<use href="#bg" fill="url(#noise)"/>',
            '<use href="#bg" x="',Strings.toString(Rando.number(comp_.seed0, 0, 700)),'" y="',Strings.toString(Rando.number(comp_.seed1, 0, 700)),'" height="',Strings.toString(Rando.number(comp_.seed2, 0, 100)),'" width="',Strings.toString(Rando.number(comp_.seed3, 0, 100)),'" fill="url(#raster)"/>',
            '</g>',
            '</svg>'
        ));

        return output_;

    }


    function _getMark(uint comp_id_, ILW_00x0.CompInfo memory comp_) private pure returns(string memory){
        string memory lift_text_ = Strings.toString((comp_.orientation < 50 ? 1000 : 700)-12);
        return string(abi.encodePacked('<style>.txt{font: normal 12px monospace;fill: white;}</style><rect width="95" height="30" x="0" y="',Strings.toString((comp_.orientation < 50 ? 1000 : 700)-30),'" fill="#000" class="box"></rect><text x="12" y="',lift_text_,'" class="txt">#',(comp_id_ < 10 ? string(abi.encodePacked('0', Strings.toString(comp_id_))) : Strings.toString(comp_id_)),' \xc2\xb7 00x0</text><text x="103" y="',lift_text_,'" class="txt">',comp_.seed0,'</text>'));
    }

}