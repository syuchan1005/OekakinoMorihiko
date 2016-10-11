package com.github.syuchan1005.oekakinomorihiko;

import spark.Spark;

/**
 * Created by syuchan on 2016/10/11.
 */
public class OekakinoMorihiko {
	public static void main(String[] args) {
		Spark.staticFileLocation("/public");
		Spark.webSocket("/web", WebSocketHandler.class);
		Spark.webSocketIdleTimeoutMillis(300000); // 5min
		Spark.init();
	}
}
