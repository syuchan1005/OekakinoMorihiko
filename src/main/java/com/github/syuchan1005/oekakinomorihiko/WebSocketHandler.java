package com.github.syuchan1005.oekakinomorihiko;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsonorg.JsonOrgModule;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Created by syuchan on 2016/10/11.
 */
@WebSocket
public class WebSocketHandler {
	private static Set<Session> sessions = Collections.synchronizedSet(new HashSet<>());
	private static ObjectMapper mapper = new ObjectMapper();
	private static TypeReference<HashMap<String, Object>> reference = new TypeReference<HashMap<String, Object>>() {};
	static {
		mapper.registerModule(new JsonOrgModule());
	}

	@OnWebSocketConnect
	public void onConnect(Session session) throws Exception {
		sessions.add(session);
		broadcastMessage("{ \"session_count_load\": \"" + sessions.size() + "\"}");
	}

	@OnWebSocketClose
	public void onClose(Session session, int statusCode, String reason) throws IOException {
		sessions.remove(session);
		broadcastMessage("{ \"session_count_load\": \"" + sessions.size() + "\"}");
	}

	@OnWebSocketMessage
	public void onMessage(Session session, String message) throws IOException, JSONException {
		if (message.equals("Keep-Alive")) return;
		JSONObject jsonObject = mapper.readValue(message, JSONObject.class);
		jsonObject.put("session_count", sessions.size());
		broadcastMessage(jsonObject.toString());
	}

	private void broadcastMessage(String message) {
		sessions.stream()
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