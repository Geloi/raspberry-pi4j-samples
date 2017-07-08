package http;

import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RESTProcessorUtil {

	/**
	 * Check path identity, even if they contains prms.
	 * Ex: /one/{one}/two/{two} and /one/{a}/two/{b} are identical
	 *
	 * @param one path to compare with two
	 * @param two path to compare with one
	 * @return true if paths match.
	 */
	public static boolean pathsAreIndentical(String one, String two) {
		boolean match = true;
		String[] oneElem = one.split("/");
		String[] twoElem = two.split("/");

		if (oneElem.length == twoElem.length) {
			for (int i = 0; match && i < oneElem.length; i++) {
				if (oneElem[i].startsWith("{") && oneElem[i].endsWith("}") &&
								twoElem[i].startsWith("{") && twoElem[i].endsWith("}")) {
					match = true;
				} else {
					match = oneElem[i].equals(twoElem[i]);
				}
			}
		} else {
			match = false;
		}
		return match;
	}

	/**
	 * Compare a path definition with a path occurrence
	 *
	 * @param pattern like /first/{val}
	 * @param path    like /first/a
	 * @return true if the path matches the pattern
	 */
	public static boolean pathMatches(String pattern, String path) {
		boolean match = true;
		String[] patternElem = pattern.split("/");
		String[] pathElem = path.split("/");

		if (patternElem.length == pathElem.length) {
			for (int i = 0; match && i < patternElem.length; i++) {
				if (patternElem[i].startsWith("{") && patternElem[i].endsWith("}")) {
					match = true;
				} else {
					match = patternElem[i].equals(pathElem[i]);
				}
			}
		} else {
			match = false;
		}
		return match;
	}

	/**
	 * Extract parameter(s) value(s) from a path occurrence matching a pattern
	 *
	 * @param pattern /one/{a}/two/{b}
	 * @param path    /one/x/two/y
	 * @return x, y
	 */
	public static List<String> getPrmValues(String pattern, String path) {
		List<String> returned = new ArrayList<>();
		String[] patternElem = pattern.split("/");
		String[] pathElem = path.split("/");

		if (patternElem.length == pathElem.length) {
			for (int i = 0; i < patternElem.length; i++) {
				if (patternElem[i].startsWith("{") && patternElem[i].endsWith("}")) {
					returned.add(pathElem[i]);
				}
			}
		}
		return returned;
	}

	/* Utility(ies) */

	public static void generateHappyResponseHeaders(HTTPServer.Response response, int contentLength) {
		generateHappyResponseHeaders(response, "application/json", contentLength);
	}

	public static void generateHappyResponseHeaders(HTTPServer.Response response, String contentType, int contentLength) {
		Map<String, String> responseHeaders = new HashMap<>();
		responseHeaders.put("Content-Type", contentType);
		responseHeaders.put("Content-Length", String.valueOf(contentLength));
		responseHeaders.put("Access-Control-Allow-Origin", "*");
		response.setHeaders(responseHeaders);
	}

	public static void addErrorMessageToResponse(HTTPServer.Response response, String errMess) {
		String content = new Gson().toJson(new ErrorMessage(errMess)).toString();
		RESTProcessorUtil.generateHappyResponseHeaders(response, content.length());
		response.setPayload(content.getBytes());
	}

	/**
	 * Used along with HTTP Error codes to contain a more significant message.
	 */
	public static class ErrorMessage {
		private String message;

		public ErrorMessage(String mess) {
			this.message = mess;
		}
	}
}
