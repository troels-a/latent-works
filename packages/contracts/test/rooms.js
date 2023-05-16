const { expect } = require("chai");
const fs = require('fs');
const path = require('path').dirname(__dirname);
const Preview = require('../preview.js');
// const generateSVG = require("./mempools/svg.js");

describe('Rooms test suite', function(){

    let
    _rooms,
    owner
    ;

    it('init', async function(){

        const LWRooms = await hre.ethers.getContractFactory("LWRooms");
        _rooms = await LWRooms.deploy();
        await _rooms.deployed();

        [owner] = await hre.ethers.getSigners();

        expect(await _rooms.name()).to.equal('LWRooms');

    })

    it('mint', async function(){

        const tx = await _rooms.mint();
        await tx.wait();

        expect (await _rooms.totalSupply()).to.equal(1);
        expect (await _rooms.ownerOf(1)).to.equal(owner.address);

    })

    it('generate image', async function(){

        await fs.promises.mkdir(`${path}/temp`, {recursive: true}).catch(console.error);

        const tokenURI = await _rooms.tokenURI(1);
        const json = Buffer.from(tokenURI.replace(/^data\:application\/json\;base64\,/, ''), 'base64').toString('utf-8');
        const meta = JSON.parse(json);

  
        // Get the image data
        const image = meta.image;
        const app = meta.app;

        const svg = Buffer.from(image.replace(/^data\:image\/svg\+xml\;base64\,/, ''), 'base64').toString('utf-8');
        const html = Buffer.from(app.replace(/^data\:text\/html\;base64\,/, ''), 'base64').toString('utf-8');

        // Write the image to a file
        fs.writeFileSync(`${path}/temp/room.svg`, svg, {flag: 'w'});
        fs.writeFileSync(`${path}/temp/room.html`, html, {flag: 'w'});
    });

})

