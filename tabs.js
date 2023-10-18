chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: 'OFF',
    });
    console.log("hello");
});

chrome.action.onClicked.addListener(async() => {

    const prevState = await chrome.action.getBadgeText({});
    const nextState = prevState === 'ON' ? 'OFF' : 'ON';

    if(nextState === 'ON'){
        await chrome.action.setBadgeText({
                text: nextState,
            });
        const tabsList = {};
        const tabs = await chrome.tabs.query({});
        console.log(tabs);

        tabs.forEach((tab) =>{
            const hostname = new URL(tab.url).hostname.replace('www.', '').split('.')[0];
            if(!tabsList[hostname]){
                tabsList[hostname] = {
                    tabsIds: [],
                };
            }
                tabsList[hostname].tabsIds.push(tab.id);
                console.log("done\n");
        
        });
        console.log(tabsList);
        console.log(Object.keys(tabsList)[0]);
        console.log(tabsList[Object.keys(tabsList)[0]]);
    
        Object.keys(tabsList).forEach(async (hostname) => {
            if(tabsList[hostname].tabsIds.length > 1){
                const grpId = await chrome.tabs.group({
                    tabIds: tabsList[hostname].tabsIds
                });
    
                chrome.tabGroups.update(grpId, {
                    collapsed: true,
                    title: hostname
                });
            }
        });


    }

    if(nextState === 'OFF'){
        await chrome.action.setBadgeText({
            text: nextState,
        });
        const tabs = await chrome.tabs.query({});
        tabs.forEach((tab) =>{
            chrome.tabs.ungroup(tab.id);
        });
    }

    
});
