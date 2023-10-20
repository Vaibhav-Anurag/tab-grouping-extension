// importing package
import ColorThief from "/node_modules/colorthief/dist/color-thief.mjs";

const groupButton = document.getElementById('group');
const ungroupButton = document.getElementById('ungroup');

groupButton.addEventListener("click", async() =>{
const tabsList = {};    // creating an object that holds key as hostname and value as an array of tabId & color
const tabs = await chrome.tabs.query({}); //getting all the tabs
//console.log(tabs);

for(const tab of tabs){
    const hostname = new URL(tab.url).hostname.replace('www.', '').split('.')[0]; // extracting domain name from the name of website
    if(!tabsList[hostname]){        // this condition checks if hostname already exists as a key
        const temp = await getColors(tab.favIconUrl); // getting the colors of favIcon
        tabsList[hostname] = { // creating a new key as hostname
            tabsIds: [],
            colour: temp
        };
        // console.log(hostname);
        // console.log(tabsList[hostname].colour);
    }
        // console.log('hemmlo');
        tabsList[hostname].tabsIds.push(tab.id); // pushing the tab to the array of its hostname
}


Object.keys(tabsList).forEach(async (hostname) => {
    if(tabsList[hostname].tabsIds.length > 1){
        const grpId = await chrome.tabs.group({    // group all the tabs of same array into one and return the group Id
            tabIds: tabsList[hostname].tabsIds
        });
            //console.log('hello');
            //console.log( rgbToHex(tabsList[hostname].colour[0],tabsList[hostname].colour[1],tabsList[hostname].colour[2]));
            
            chrome.tabGroups.update(grpId, { //setting the properties of the created group
                collapsed: true,
                title: hostname,
                color: closestColor(tabsList[hostname].colour)
            });
        }
    });

});

ungroupButton.addEventListener("click", async()=>{ //this checks through every tab and ungroups it
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) =>{
        chrome.tabs.ungroup(tab.id);
    });
});

const rgbToHex = (r, g, b) => 'x' + [r, g, b].map(x => { // I added 'x' here because in the 'pallet object' it was giving an error when '#' was used
     //this function converts the color coding from rgb to hex 
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')

function getColors(url){ // this function returns the color of the image in url
    return new Promise((resolve, reject) => { // returning a promise because undefined array was returned otherwise
        let color = new Array(3);
    if(!url){ 
        resolve([128,128,128]);
        return;
    }

    const colorThief = new ColorThief();

    let img = document.createElement('img');
    img.src = url;
    // console.log(url);
     
    if (img.complete) { // if image is loaded
        try{
            color = colorThief.getColor(img);
            resolve (color);
        }
        catch(err){
            resolve([128,128,128]); // colorThief.GetColor() gets an error when a null pixel in found so this gives a fallback option
        }
        return;
      }
       
    else{
            img.addEventListener('load', function() { // after image has loaded
                try{
                    color = colorThief.getColor(img);
                    resolve (color);
                }
                catch(err){
                    resolve([128,128,128]);
                }
        
            }); 
        }

    })
    

  }
  // all the colors available to be used as group's colour
  const colorArray = [[128,128,128],[0,0,255],[255,0,0],[255,255,0],[0,255,0],[255,192,203],[128,0,128],[0,255,255],[255,165,0]];
  // a map with keys as hex and value as color name
    const pallet = {
        x808080:'grey',
        x0000ff:'blue',
        xff0000:'red',
        xffff00:'yellow',
        x00ff00:'green',
        xffc0cb:'pink',
        x800080:'purple',
        x00ffff: 'cyan',
        xffa500 : 'orange'
  }

    const closestColor = (tc) => { //this finds the color closest to the input color
        let closestDistance = 9999999;
        let closestColor = null;
    
    colorArray.forEach((cl) => {
        const distance = Math.sqrt(
            (tc[0] - cl[0]) ** 2 +
            (tc[1] - cl[1]) ** 2 +
            (tc[2] - cl[2]) ** 2
        );
      
        if (distance < closestDistance) {
            closestDistance = distance;
            closestColor = cl;
        }
    });
    
    const col = rgbToHex(closestColor[0],closestColor[1],closestColor[2]);
    return pallet[col]; //returns the name of the color from pallet

  }
