package paddle;

import com.pi4j.io.gpio.GpioController;
import com.pi4j.io.gpio.GpioFactory;
import com.pi4j.io.gpio.RaspiPin;
import com.pi4j.io.gpio.exception.UnsupportedPinPullResistanceException;
import paddle.buttons.PushButtonInstance;
import raspisamples.adc.JoyStick;
import raspisamples.adc.JoyStickClient;

/**
 * A joystick, and 4 buttons.
 *
 * Joystick:
 * - Move forward
 * - Move backward
 * - Turn right
 * - Turn left
 *
 * 4 Buttons:
 * - Up
 * - Down
 * - Open claw
 * - Close claw
 */
public class ForMeArm {

	private static PushButtonInstance up        = null;
	private static PushButtonInstance down      = null;
	private static PushButtonInstance openClaw  = null;
	private static PushButtonInstance closeClaw = null;

	private final static GpioController gpio = GpioFactory.getInstance();

	public static void main(String... args) {

		JoyStickClient jsc = new JoyStickClient() {
			@Override
			public void setUD(int v) { // 0..100
				float angle = (float) (v - 50) * (9f / 5f);
				System.out.println(String.format("UD Angle: %f", angle));
				//	  ss1.setAngle(angle); // -90..+90
			}

			@Override
			public void setLR(int v) { // 0..100
				float angle = (float) (v - 50) * (9f / 5f);
				System.out.println(String.format("LR Angle: %f", angle));
//		  ss2.setAngle(angle); // -90..+90
			}
		};

		Thread joystickThread = new Thread(() -> {
			try {
				new JoyStick(jsc, false);
			} catch (Exception e) {
				e.printStackTrace();
			} finally {
//		ss1.stop();
//		ss2.stop();
				System.out.println("Bye");
			}
		});
		joystickThread.start();
		System.out.println("Joystick thread started");

		try {
			up        = new PushButtonInstance(gpio, RaspiPin.GPIO_00, "UP",    (event) -> System.out.println(String.format(">>>>>>>>>>>>>>  Received button event (%s) %s", event.getEventType().toString(), event.getPayload())));
			down      = new PushButtonInstance(gpio, RaspiPin.GPIO_01, "DOWN",  (event) -> System.out.println(String.format(">>>>>>>>>>>>>>  Received button event (%s) %s", event.getEventType().toString(), event.getPayload())));
			openClaw  = new PushButtonInstance(gpio, RaspiPin.GPIO_02, "OPEN",  (event) -> System.out.println(String.format(">>>>>>>>>>>>>>  Received button event (%s) %s", event.getEventType().toString(), event.getPayload())));
 			closeClaw = new PushButtonInstance(gpio, RaspiPin.GPIO_03, "CLOSE", (event) -> System.out.println(String.format(">>>>>>>>>>>>>>  Received button event (%s) %s", event.getEventType().toString(), event.getPayload())));
		} catch (UnsupportedPinPullResistanceException uppre) {
			System.err.println("Un-appropriate pin: ");
			uppre.printStackTrace();
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		// Now wait for Ctrl+C
		Thread waiter = Thread.currentThread();
		Runtime.getRuntime().addShutdownHook(new Thread(() -> {
			synchronized (waiter) {
				waiter.notify();
				try {
					Thread.sleep(20);
				} catch (Exception ex) {
				}
				System.out.println("Bye");
			}
		}));
		System.out.println("Ready...");
		synchronized (waiter) {
			try {
				waiter.wait();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		System.out.println("\nDone reading buttons.");
		gpio.shutdown();
	}
}