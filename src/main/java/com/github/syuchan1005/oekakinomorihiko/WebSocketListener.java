package com.github.syuchan1005.oekakinomorihiko;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsonorg.JsonOrgModule;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@WebSocket(maxIdleTime = 300000)
public class WebSocketListener {
	private static long id = 1;
	private static Map<Session, SessionData> sessions = Collections.synchronizedMap(new HashMap<>());
	private static ObjectMapper mapper = new ObjectMapper();

	static {
		mapper.registerModule(new JsonOrgModule());
	}

	private static List<String> chat = new ArrayList<>();

	private Session session;

	@OnWebSocketConnect
	public void onConnect(Session session) throws Exception {
		this.session = session;
		List<String> name = session.getUpgradeRequest().getParameterMap().get("name");
		if (name == null || name.size() != 1) {
			sessions.put(session, new SessionData(id, "no name"));
			session.disconnect();
			return;
		}
		sessions.put(session, new SessionData(id, name.get(0)));
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("sessionCountLoad", sessions.size());
		broadcastMessage(jsonObject.toString());
		jsonObject.put("selfSessionId", id);
		jsonObject.put("selfSessionName", name.get(0));
		session.getRemote().sendStringByFuture(jsonObject.toString());
		sendOlderCanvas(session);
		sendLatestChat(session);
		System.out.println("Connect:{ ID: " + id + " }");
		id++;
	}

	@OnWebSocketClose
	public void onClose(int statusCode, String reason) throws Exception {
		System.out.println("Close:{ ID: " + sessions.get(session).getId() + " }");
		sessions.remove(session);
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("mode", "close");
		jsonObject.put("sessionCountLoad", sessions.size());
		broadcastMessage(jsonObject.toString());
	}

	@OnWebSocketMessage
	public void onMessage(String message) throws Exception {
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
			jsonObject.put("sessionId", sessions.get(session).getId());
			jsonObject.put("sessionName", sessions.get(session).getUserName());
			if (jsonObject.getString("mode").equalsIgnoreCase("chat")) {
				chat.add(jsonObject.toString());
			}
			broadcastMessage(jsonObject.toString());
		}
	}

	protected static void sendLatestChat(Session session) {
		for (String s : chat) {
			session.getRemote().sendStringByFuture(s);
		}
	}

	protected static Session getKey(long id) {
		for (Map.Entry<Session, SessionData> e : sessions.entrySet()) {
			if (e.getValue().getId() == id) return e.getKey();
		}
		return null;
	}

	protected static JSONObject sendOlderCanvas(Session session) {
		Set<Map.Entry<Session, SessionData>> entries = sessions.entrySet();
		if (!entries.isEmpty()) {
			Optional<Map.Entry<Session, SessionData>> first = entries.stream()
					.filter(o1 -> o1.getKey() != session)
					.sorted((o1, o2) -> (int) (o1.getValue().getId() - o2.getValue().getId()))
					.findFirst();
			first.ifPresent(entry -> {
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("sessionCount", sessions.size());
				jsonObject.put("mode", "canvas");
				jsonObject.put("option", "send");
				jsonObject.put("sendId", sessions.get(session).getId());
				jsonObject.put("sessionName", sessions.get(session).getUserName());
				entry.getKey().getRemote().sendStringByFuture(jsonObject.toString());
			});
		}
		return null;
	}

	protected static void broadcastMessage(String message) {
		sessions.keySet().stream()
				.filter(Session::isOpen)
				.forEach(s -> {
					s.getRemote().sendStringByFuture(message);
				});
	}

	class SessionData {
		private long id;
		private String userName;

		public SessionData(long id, String userName) {
			this.id = id;
			this.userName = userName;
		}

		public long getId() {
			return id;
		}

		public String getUserName() {
			return userName;
		}

		public Session getSession() {
			return session;
		}
	}
}