package com.github.syuchan1005.oekakinomorihiko;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsonorg.JsonOrgModule;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

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
		session.getRemote().sendStringByFuture(jsonObject.toString());
		sendOlderCanvas(session);
		System.out.println("Connect:{ ID: " + id + " }");
		id++;
	}

	@OnWebSocketClose
	public void onClose(Session session, int statusCode, String reason) throws Exception {
		sessions.remove(session);
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("mode", "close");
		jsonObject.put("sessionCountLoad", sessions.size());
		broadcastMessage(jsonObject.toString());
		System.out.println("Close:{ ID: " + sessions.get(session) + " }");
	}

	@OnWebSocketMessage
	public void onMessage(Session session, String message) throws Exception {
		if (message.equals("KeepAlive")) {
			session.getRemote().sendStringByFuture("KeepAlive");
			return;
		}
		JSONObject jsonObject = mapper.readValue(message, JSONObject.class);
		if (jsonObject.has("sendId")) {
			Session session1 = getKey(jsonObject.getLong("sendId"));
			session1.getRemote().sendStringByFuture(message);
		} else {
			jsonObject.put("sessionCount", sessions.size());
			jsonObject.put("sessionId", sessions.get(session));
			broadcastMessage(jsonObject.toString());
		}
	}

	protected Session getKey(long id) {
		for (Map.Entry<Session, Long> e : sessions.entrySet()) {
			if (e.getValue() == id) return e.getKey();
		}
		return null;
	}

	protected JSONObject sendOlderCanvas(Session session) {
		Set<Map.Entry<Session, Long>> entries = sessions.entrySet();
		if (!entries.isEmpty()) {
			Optional<Map.Entry<Session, Long>> first = entries.stream()
					.filter(o1 -> o1.getKey() != session)
					.sorted((o1, o2) -> (int) (o1.getValue() - o2.getValue()))
					.findFirst();
			first.ifPresent(entry -> {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("sessionCount", sessions.size());
				jsonObject.put("mode", "canvas");
				jsonObject.put("option", "send");
				jsonObject.put("sendId", sessions.get(session));
				entry.getKey().getRemote().sendStringByFuture(jsonObject.toString());
			});
		}
		return null;
	}

	protected void broadcastMessage(String message) {
		sessions.keySet().stream()
				.filter(Session::isOpen)
				.forEach(s -> {
					s.getRemote().sendStringByFuture(message);
				});
	}
}