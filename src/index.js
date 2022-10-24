const http = require('./lib/http-server');
const ws = require('./lib/ws-server');
const utils = require('./lib/utils');

const AUTH_TOKEN = process.env.TOKEN;

ws.init({

    onconnect(peer) {

        if (!('data' in peer)) return;
        if (!('id' in peer.data)) return;
        if (!('token' in peer.data)) return;
        if (peer.data.token != AUTH_TOKEN) return;

        ws.add(peer.data.id, peer);
        ws.online(peer.data.id);
    },

    onclose(peer) {

        if (!('data' in peer)) return;
        if (!('id' in peer.data)) return;

        ws.offline(peer.data.id);
        ws.del(peer.data.id);
    },

    ondata(peer, message) {

        const data = JSON.parse(message);

        if (!('mode' in data)) return;
        if (!('data' in data)) return;

        switch (data.mode) {

            case 'broadcast':
                ws.broadcast(peer.data.id, data.data);
                break;

            case 'direct':

                if (!('to' in data)) return;
                ws.direct(peer.data.id, data.to, data.data);
                break;

        }

    },

    http: http.init({

        port: 80,

        onrequest: (p) => new Promise(async (res, rej) => {

            var data = null;

            utils.log.debug(`HTTP ${p.method} ${p.url} from ${p.ip}`);

            if (!('id' in p.query)) return rej({ error: 'invalid user id' });
            if (!('token' in p.query)) return rej({ error: 'token not found' });
            if (p.query.token != AUTH_TOKEN) return rej({ error: 'invalid token' });

            switch (p.path) {

                case '/broadcast':
                    try { data = JSON.parse(p.body); }
                    catch (e) { data = { message: p.body }; }
                    return res({ delivered: ws.broadcast(p.query.id, data) });

                case '/direct':
                    try { data = JSON.parse(p.body); }
                    catch (e) { data = { message: p.body }; }
                    if (!('to' in p.query)) return rej({ error: 'invalid target' });
                    return res({ delivered: ws.direct(p.query.id, p.query.to, data) });

            }

            rej({ code: 404, error: 'not found' })

        })

    })

})