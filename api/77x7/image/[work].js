import chromium from 'chrome-aws-lambda';
import core from 'puppeteer-core';
import { ethers } from 'ethers';
import abi from '../../../src/base/abi/77x7.json';

const exePath = process.platform === 'win32'
? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
: process.platform === 'linux'
? '/usr/bin/google-chrome'
: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';


const isDev = () => {
    return (process.env.VERCEL_ENV === 'development')
}

const getAbsoluteURL = (path) => {
    const baseURL = isDev() ? "http://localhost:3000" : `https://${process.env.VERCEL_URL}`;
    return baseURL + path
}

async function getOptions(isDev) {
    if (isDev) {
        return {
            args: [],
            executablePath: exePath,
            headless: true
        };
    } else {
        return {
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        };
    }
}

function parseBool(input){
    if(typeof input == 'string')
        return input == 'false' ? false : true;
    if(typeof input == 'integer')
        return input > 0 ? true : false;
    return input;
}

export default async (req, res) => {
    
    const {work, edition, format, mark, size} = Object.assign({size: 777, edition: 7, format: 'svg', mark: true}, req.query);
    
    const sizeInt = parseInt(size);

    if(!(size <= 100 && size >= 1000) && size % 100 !== 0){
        throw 'Invalid size';
    }
        

    const address = "0xef7c89f051ac48885b240eb53934b04fcf3339ab";
    const provider = new ethers.providers.InfuraProvider("homestead", process.env.INFURA_ID);
    
    const contract = new ethers.Contract(address, abi, provider);
    const data_url = await contract.getSVG(parseInt(work), parseInt(edition), parseBool(mark));
    let data = false;

    if(format != 'svg'){
        const options = await getOptions(isDev());
        const browser = await core.launch(options);
        const page = await browser.newPage();
        await page.setViewport({ width: sizeInt, height: sizeInt});

        await page.goto(data_url, {
        waitUntil: 'networkidle2',
        })
        
        data = await page.screenshot({
            type: format
        })
        
        await browser.close()
    }
    else {
        data = Buffer.from(data_url.replace(/^data\:image\/svg\+xml\;base64\,/, ''), 'base64').toString('utf-8');
    }


    let content_type = 'image/svg+xml';
    if(format != 'svg')
        content_type = 'image/'+format;

    res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate")
    res.setHeader('Content-Type', content_type);
    res.end(data);

}