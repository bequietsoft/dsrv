function CreateData() {

    if (App.data == undefined) App.data = [];
    
    var size = 0;
    for(let i = 0; i < 1; i++) {
        
        var cnc = test_cinc(1);

        size += Object.keys(cnc).length;
        App.data.push(cnc.mesh);
        App.scene.add(cnc.mesh);
    }

    log('new objects created. total size = ' + Math.floor(size/1024) + 'KB');
}

function DeleteData() {
    
    if (App.data == undefined) return;

    for(let i = 0; i < App.data.length; i++) {
        App.scene.remove(App.data[i]);
        App.data[i].geometry.dispose();
        App.data[i].material.dispose();
        App.data[i] = undefined;
    }
    App.data = [];
    App.renderer.renderLists.dispose();

    log('all objects deleted');
}

