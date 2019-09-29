module.exports = function NotifyConsumableExpiry(dispatch) {

    const Consumables = {
        4830: 'Bravery', // Normal
        4833: 'Bravery', // Strong
        4886: 'Bravery', // Normal
        4953: 'Canephora', // Normal
        4955: 'Canephora', // Strong
        920:  'Noctenium', // Uncommon
        921:  'Noctenium', // Rare
        922:  'Noctenium', // Superior
    };
    
    let gameId = undefined,
        activeConsumables = [];
    
    dispatch.hook('S_LOGIN', 13, (event) => {
        gameId = event.gameId;
        activeConsumables = [];
    });
	
    /*
        Abnormalities are removed and re-applied every time the player enters a dungeon, teleports, switch channels.
        To prevent misleading messages from being sent the module keeps track of consumables' remaining duration.
    */
	dispatch.hook('S_ABNORMALITY_BEGIN', 3, UpdateConsumables);
	dispatch.hook('S_ABNORMALITY_REFRESH', 1, UpdateConsumables);
    
    function UpdateConsumables(event) {
        if (event.target != gameId) return;
        
        let abnormality = activeConsumables.find(p => p.id == event.id);
        if (Consumables[event.id]) {
            event.startTime = Date.now();
            if (abnormality) { 
                abnormality.startTime = event.startTime; 
                abnormality.duration = event.duration; 
            }
            else { 
                activeConsumables.push(event);
            }
        }
    }
    
    dispatch.hook('S_ABNORMALITY_END', 1, (event) => {
        if (event.target != gameId) return;

        let abnormality = activeConsumables.find(p => p.id == event.id);
        if (abnormality && Date.now() > abnormality.startTime + abnormality.duration - 1000) {
            sendMessage(Consumables[event.id] + ' has expired!');
            activeConsumables = activeConsumables.filter(p => p.id != event.id);
        }
    })
    
    function sendMessage(msg) {
        dispatch.toClient('S_CHAT', 3, {
            channel: 7, 
            authorName: "",
            message: msg
		});
        
        // dispatch.toClient('S_DUNGEON_EVENT_MESSAGE', 2, {
            // type: 31, // 42 Blue Shiny Text, 31 Normal Text
            // chat: false, 
            // channel: 27, 
            // message: msg
		// });         
    }
    
}
