# 接続時

```js:connection.json
{
    "sessionCountLoad": "接続人数",
    "selfSessionId": "接続Sessionの固有Id"
}
```
    
を**全体に向けて**送信
**接続Session**に対して
    
```js:connection_session.json
{
    "sessionCount": "接続人数",
    "mode": "canvas",
    "option": "send",
    "sendId": "接続Sessionの固有Id"
}
```
    
を現在接続中の中で一番初めに接続したSessionに対して送信

# 切断時
```js:close.json
{
    "mode": "close",
    "sessionCountLoad": "接続人数",
    "sessionId": "closeしたSessionの固有Id"
}
```
    
を**全体に向けて**送信

# 受信時
送られてきた文字列が"KeepAlive"ならば**接続Session**に"KeepAlive"を送信
もし送られてきたjsonに"sendId"があったら

**sendIdにある固有IdのSessionに対して**送られてきた文字列を送信

なければ

```js:message.json
{
   "sessionCount": "接続人数",
   "sessionId": "接続Sessionの固有Id"
}
```
        
を付与して**全体に向けて**送信