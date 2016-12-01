package com.github.syuchan1005.oekakinomorihiko;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Created by syuchan on 2016/12/01.
 */
public class OekakinoMorihiko {
	public static void main(String[] args) {
		Server server = new Server(4567);
		ResourceHandler resourceHandler = new ResourceHandler();

		ServletContextHandler contextHandler = new ServletContextHandler(ServletContextHandler.SESSIONS);
		contextHandler.addServlet(new ServletHolder(new WebSocketServlet() {
			@Override
			protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
				String[] names = request.getParameterMap().get("name");
				if (names == null || names.length != 1) {
					response.sendError(403, "\"name\" is not found");
					return;
				}
				super.service(request, response);
			}

			@Override
			public void configure(WebSocketServletFactory webSocketServletFactory) {
				webSocketServletFactory.register(WebSocketListener.class);
			}
		}), "/web");

		HandlerList handlers = new HandlerList();
		handlers.setHandlers(new Handler[]{resourceHandler, contextHandler});
		server.setHandler(handlers);

		try {
			server.start();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
