import ColorThief from "/node_modules/colorthief/dist/color-thief.mjs";

const groupButton = document.getElementById('group');
const ungroupButton = document.getElementById('ungroup');

groupButton.addEventListener("click", async() =>{
const tabsList = {};
const tabs = await chrome.tabs.query({});
console.log(tabs);

for(const tab of tabs){
    const hostname = new URL(tab.url).hostname.replace('www.', '').split('.')[0];
    if(!tabsList[hostname]){
        const temp = await getColors(tab.favIconUrl);
        tabsList[hostname] = {
            tabsIds: [],
            colour: temp
        };
        console.log(hostname);
        console.log(tabsList[hostname].colour);
    }
        console.log('hemmlo');
        tabsList[hostname].tabsIds.push(tab.id);
}


Object.keys(tabsList).forEach(async (hostname) => {
    if(tabsList[hostname].tabsIds.length > 1){
        const grpId = await chrome.tabs.group({
            tabIds: tabsList[hostname].tabsIds
        });
            //console.log('hello');
            //console.log( rgbToHex(tabsList[hostname].colour[0],tabsList[hostname].colour[1],tabsList[hostname].colour[2]));
            chrome.tabGroups.update(grpId, {
            collapsed: true,
            title: hostname,
            color: closestColor(tabsList[hostname].colour)
            });
        }
    });

});

ungroupButton.addEventListener("click", async()=>{
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) =>{
        chrome.tabs.ungroup(tab.id);
    });
});

const rgbToHex = (r, g, b) => 'x' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')

function getColors(url){
    return new Promise((resolve, reject) => {
        let color = new Array(3);
    if(!url){ 
        resolve([128,128,128]);
        return;
    }

    const colorThief = new ColorThief();

    let img = document.createElement('img');
    img.src = url;
    console.log(url);
     
    if (img.complete) {
        try{
            color = colorThief.getColor(img);
            resolve (color);
            }
            catch(err){
                resolve([128,128,128]);
            }
        return;
      }
       
    else{
            img.addEventListener('load', function() {
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

  const colorArray = [[128,128,128],[0,0,255],[255,0,0],[255,255,0],[0,255,0],[255,192,203],[128,0,128],[0,255,255],[255,165,0]];
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

  const closestColor = (tc) => {
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
    return pallet[col];

  }
