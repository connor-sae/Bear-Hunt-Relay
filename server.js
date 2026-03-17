const express = require("express");

const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

//middleware 
app.use(bodyParser.json());

/// rooms formated as {string name, bool isPublic, string privIP, string pubIP, int playercount}

rooms = [
    // {
    //     name: 'empty',
    //     isPublic: false
    //     privateIP: '127.0.0.1'
    //     publicIP: 'xxx'
    //     players: 0
    // },
]
// type : all, joinable, public, local
app.get('/api/rooms/:type', (req, res) =>
{
    switch(req.params.type)
    {
        case 'all':
            res.status(200).json(rooms);
            break;
        case 'joinable':
            pub = getPublicRooms();
            loc = getLocalRooms(req.ip);
            res.status(200).json(loc.concat(pub));
            break;
        case 'public':
            res.status(200).json(getPublicRooms());
            break;
        case 'local':
            res.status(200).json(getLocalRooms(req.ip));
            break;
    }
});

function getPublicRooms()
{
    return rooms.filter(r => r.isPublic);
}
function getLocalRooms(publicIP)
{
    return rooms.filter(r => !r.isPublic & r.publicIP == publicIP);
}

app.post('/api/rooms', (req, res) =>
{
    const newRoom = 
    {
        name: req.body.name,
        isPublic: req.body.isPublic,
        privateIP: req.body.privateIP,
        publicIP: req.ip, // not added in post request params
        players: req.body.players,
    };

    if(canAddRoom(newRoom, res))
    {
        rooms.push(newRoom);
        console.log("new room added");
        res.status(201).json({message: 'Room: \''+newRoom.name+'\'  Successfully Added'});
    }

});

function canAddRoom(room, res)
{
    if(rooms.find(r => r.name == room.name))
    {
        console.log('Room with specified name already exists');
        res.status(409).json({message: 'Room: \''+room.name+'\' already exists'});
        return false;
    }
    if(rooms.find(r => r.publicIP == room.publicIP && r.isPublic))
    {
        console.log('public room with specified ip already exists')
        res.status(409).json({message: 'public room with the requested ip: \''+room.publicIP+'\' already exists'});
        return false;
    }
    if(room.isPublic && rooms.find(r => r.publicIP == room.publicIP))
    {
        console.log('active room with ip already exists!!')
        res.status(409).json({message: 'active room with the requested ip: \''+room.publicIP+'\' already exists'});
        return false;
    }
    
    return true;
}

app.put('/api/rooms/:name', (req, res) =>
{
    const room = rooms.find(r => r.name == newRoom.name);
    if(room)
    {
        const newRoom = 
        {
            name: req.body.name,
            isPublic: req.body.isPublic,
            privateIP: req.nody.privateIP,
            publicIP: req.ip,
            players: req.body.players,
        };

        if(canAddRoom(newRoom, res))
        {
            room = newRoom;
            res.json(room);
            return;
        }
    }
    else
    {
        res.status(404).json({message: 'Room: \''+newRoom.name+'\'  could not be found'});
    }
});

app.delete('/api/rooms/:name', (req, res) =>
{
    rooms = rooms.filter(r => r.name !== req.params.name);
    res.status(204).send();
});


app.listen(PORT, () =>
{
    console.log("server running!")
});