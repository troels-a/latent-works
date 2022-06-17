const fs = require('fs');
const path = require('path').dirname(__dirname);

async function generateSheet({filename, title, items, dir, bgcolor, txtcolor, columns}){

    await fs.promises.mkdir(dir, {recursive: true}).catch(console.error);

    let html = `
    
    <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>

                body {
                    display: flex;
                    width: 100vw;
                    height: 100vh;
                    place-items: center;
                    flex-wrap: wrap;
                    padding: 20px;
                    margin: 0;
                    box-sizing: border-box;
                    background-color: ${bgcolor};
                    font-family: Arial, Helvetica, sans-serif;
                    color: ${txtcolor};
                }
                
                body > div {
                    width: ${100/columns}%;
                    padding: 20px;
                    box-sizing: border-box;
                    display: flex;
                    place-items: center;
                    flex-direction: column;
                }

                body > div > img {
                    margin-bottom: 10px;
                }

            </style>
        </head>
        <body>
                ${items.map(item => `<div>
                    <img src="${item.src}"/>
                    ${item.url && `<div><a href="${item.url}" target="_blank">${item.label}</a></div>`}
                </div>`).join('')}
        </body>
    </html>

    `;

    await fs.writeFileSync(`${dir}/${filename}`, html, {flag: 'w'});

}


module.exports = generateSheet;