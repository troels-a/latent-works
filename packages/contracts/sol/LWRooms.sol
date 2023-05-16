// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract LWRooms is ERC721 {

    RoomGenerator public generator;

    struct Room {
        uint id;
        uint timestamp;
        address owner;
    }

    uint public constant MAX_ROOMS = 700;
    uint public _ids = 0;

    constructor() ERC721("LWRooms", "ROOM") {

        generator = new RoomGenerator(address(this));

    }


    function mint() public {
        uint id_ = _ids+1;
        _mint(msg.sender, id_);
        _ids++;
    }

    function exists(uint id_) public view returns(bool) {
        return _exists(id_);
    }


    function totalSupply() public view returns(uint) {
        return _ids;
    }


    function tokenURI(uint id_) public view override returns(string memory) {
        return getJSON(id_, true);
    }


    function getJSON(uint id_, bool encode_) public view returns(string memory) {
        

        // Create the JSON string
        bytes memory json_ = abi.encodePacked(
            '{',
                '"name":"room #',Strings.toString(id_),'",',
                '"image": "', generator.getRoomImage(id_, true),'",',
                '"app": "', generator.getRoomHTML(id_, true),'",',
                '"animation_url": "', generator.getRoomHTML(id_, true),'"',
            '}'
        );

        if(encode_) // If encode_ is true
            return string(abi.encodePacked('data:application/json;base64,', Base64.encode(json_))); // ...encode the json string
        return string(json_); // return the raw JSON

    }


    function getRoom(uint id_) public view returns(Room memory) {
        return Room(
            id_,
            block.timestamp,
            ownerOf(id_)
        );
    }




}


contract RoomGenerator {

    LWRooms public rooms;

    struct Matrix {
        uint x;
        uint y;
        uint width;
        uint height;
        uint z;
        uint scale;
    }

    struct Camera {
        uint z;
        uint x;
        uint y;
        uint zoom;
    }

    constructor(address rooms_) {
        rooms = LWRooms(rooms_);
    }

    function getRoomImage(uint id_, bool encode_) public view returns(string memory) {

        _reqRoomExists(id_);

        string memory img_ = _getRoomSVG(id_); // Get the SVG

        if(encode_) // If encode_ is true
            return string(abi.encodePacked('data:image/svg+xml;base64,', Base64.encode(bytes(img_)))); // ...encode the SVG string
        return string(img_); // return the raw SVG

    }


    function getRoomHTML(uint id_, bool encode_) public view returns(string memory) {

        _reqRoomExists(id_);

        bytes memory html_ = abi.encodePacked(
            '<html>',
                '<head>',
                    '<title>Room #',Strings.toString(id_),'</title>',
                    '<style>'
                        'body {display:flex; place-content: center; justify-content: center; max-height: 100vh; max-width: 100vw; margin: 0; padding: 0;}'
                        'svg rect:hover {fill: blue;}'
                    '</style>'
                '</head>'
                '<body>',
                    _getRoomSVG(id_),
                '</body>',
            '</html>');

        if(encode_) // If encode_ is true
            return string(abi.encodePacked('data:text/html;base64,', Base64.encode(html_))); // ...encode the HTML string
        return string(html_); // return the raw HTML
    

    }

    function _screen(Matrix memory matrix_) private pure returns(string memory) {

        bytes memory style_ = abi.encodePacked('style="transform: scale(0.',Strings.toString(matrix_.scale),') rotateZ(',Strings.toString(matrix_.z),'deg);" x="',Strings.toString(matrix_.x),'%" y="',Strings.toString(matrix_.y),'%"');

        return string(abi.encodePacked(
            '<g class="screen" filter="url(#blur)">',
                '<rect class="screen-bg" width="',Strings.toString(matrix_.width),'" height="',Strings.toString(matrix_.height),'" fill="white" ',style_,' />',
                '<rect class="screen-noise" width="',Strings.toString(matrix_.width/2),'" height="',Strings.toString(matrix_.height/2),'" filter="url(#noise)" opacity="0.5" ',style_,' />',
            '</g>'
        ));

    }

    function _getRoomSVG(uint id_) private view returns(string memory) {

        LWRooms.Room memory room_ = rooms.getRoom(id_);

        Matrix memory matrix1_ = Matrix(
            10,
            10,
            400,
            300,
            20,
            9
        );

        Matrix memory matrix2_ = Matrix(
            15,
            15,
            200,
            150,
            60,
            9
        );

        Matrix memory matrix3_ = Matrix(
            20,
            20,
            200,
            200,
            40,
            9
        );

        Camera memory camera_ = Camera(
            0,
            0,
            0,
            99
        );

        return string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">',
                '<defs>'
                    '<style>'
                        '@keyframes flicker {',
                            '0% {opacity: 1;}',
                            '80% {opacity: 1;}',
                            '81% {opacity: 0.9;}',
                            '82% {opacity: 1;}',
                            '95% {opacity: 0.7;}',
                            '100% {opacity: 0.8;}',
                        '}',
                        '#screens {'
                            'transform: rotateZ(',Strings.toString(camera_.z),'deg) translate(',Strings.toString(camera_.x),'%,',Strings.toString(camera_.y),'%) scale(0.',Strings.toString(camera_.zoom),');',
                            // 'animation: flicker 0.1s infinite;',
                            'transform-origin: center center;'
                        '}',
                        '.screen {'
                            // 'transform-origin: center center;'
                        '}',

                        '.screen-bg, .screen-noise {'
                            'transform-origin: center center;'
                        '}',

                        '</style>',
                    '<filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="10" stitchTiles="stitch" /></filter>',
                    '<filter id="blur" x="0" y="0"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter>',
                '</defs>'
                '<g id="room">',
                    '<rect width="1100" height="1100" x="-50" y="-50" fill="black"/>',
                    '<g id="screens" filter="url(#blur)">',
                        _screen(matrix1_),
                        _screen(matrix2_),
                        _screen(matrix3_),
                    '</g>',
                    '<rect width="1000" height="1000" filter="url(#noise)" opacity="0.3" />',
                '</g>',
            '</svg>'
        ));

    }

    function _reqRoomExists(uint id_) internal view {
        require(rooms.exists(id_), "ROOM_DOES_NOT_EXIST");
    }

}