import chromium from 'chrome-aws-lambda';
import core from 'puppeteer-core';
import { ethers } from 'ethers';
import abi from '@abi/LatentWorks.sol/LatentWorks_77x7.json';
import { getProvider } from 'base/utils';

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
    
    const {work, edition, format, mark, size} = Object.assign({size: 'medium', edition: 7, format: 'svg', mark: true}, req.query);
    
    const address = process.env.NEXT_PUBLIC_CONTRACT;
    const provider = getProvider();
    const contract = new ethers.Contract(address, abi, provider);
    const data_url = await contract.getSVG(parseInt(work), parseInt(edition), parseBool(mark));
    let data = false;

    if(format != 'svg'){
        const options = await getOptions(isDev());
        const browser = await core.launch(options);
        const page = await browser.newPage();
        await page.setViewport({ width: size == 'large' ? 1400 : 700, height: size == 'large' ? 1400 : 700});

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