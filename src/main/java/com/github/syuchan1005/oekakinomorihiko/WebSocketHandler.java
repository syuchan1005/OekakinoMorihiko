package com.github.syuchan1005.oekakinomorihiko;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsonorg.JsonOrgModule;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by syuchan on 2016/10/11.
 */
@WebSocket
public class WebSocketHandler {
	private static long id = 1;
	private static Map<Session, Long> sessions = Collections.synchronizedMap(new HashMap<>());
	private static ObjectMapper mapper = new ObjectMapper();
	static {
		mapper.registerModule(new JsonOrgModule());
	}

	@OnWebSocketConnect
	public void onConnect(Session session) throws Exception {
		sessions.put(session, id);
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("sessionCountLoad", sessions.size());
		broadcastMessage(jsonObject.toString());
		jsonObject.put("selfSessionId", id);
		session.getRemote().sendString(jsonObject.toString());
		id += 1;
	}

	@OnWebSocketClose
	public void onClose(Session session, int statusCode, String reason) throws Exception {
		sessions.remove(session);
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("sessionCountLoad", sessions.size());
		jsonObject.put("sessionId", sessions.get(session));
		broadcastMessage(jsonObject.toString());
	}

	@OnWebSocketMessage
	public void onMessage(Session session, String message) throws Exception {
		if (message.equals("Keep-Alive")) return;
		JSONObject jsonObject = mapper.readValue(message, JSONObject.class);
		jsonObject.put("sessionCount", sessions.size());
		jsonObject.put("sessionId", sessions.get(session));
		broadcastMessage(jsonObject.toString());
	}

	private void broadcastMessage(String message) {
		sessions.keySet().stream()
				.filter(Session::isOpen)
				.forEach(s -> {
					try {
						s.getRemote().sendString(message);
					} catch (IOException e) {
						e.printStackTrace();
					}
				});
	}
}