const url = require('url');
const ws = require('ws');

module.exports = {

    peers: {},
    server: null,
    bounce: null,

    init(conf) {

        try {

            this.server = new ws.Server({ server: conf.http });

            this.server.on('connection', (peer, req) => {

                peer.ip = req.connection.remoteAddress.replace('::ffff:', '');
                peer.on('message', (data) => conf.ondata(peer, data));
                peer.data = url.parse(req.url, true).query;
                peer.on('close', () => conf.onclose(peer));
                conf.onconnect(peer);

            });

        } catch (e) { utils.log.error({ init: `${e.message || e}` }); }

    },

    offline(from) { this.broadcast(from, 'offline', 'status'); },
    online(from) { this.broadcast(from, 'online', 'status'); },

    broadcast(from, data, mode = 'broadcast') {
        var total = 0;
        const json = JSON.stringify({ from, mode, data });
        for (var id in this.peers) {
            if (id != from) {
                this.peers[id].send(json);
                total += 1;
            }
        }
        return total;
    },

    direct(from, to, data) {
        const json = JSON.stringify({ from, mode: 'direct', data });
        if (!(to in this.peers)) return false;
        this.peers[to].send(json);
        return true;
    },

    add(id, peer) {
        this.peers[id] = peer;
    },

    del(id) {
        delete this.peers[id];
    }

};