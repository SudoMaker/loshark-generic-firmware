# LoShark Generic Firmware \[JavaScript only\]

This firmware is designed for the LoShark LoRa USB dongle to work with our official [dashboard](https://su.mk/loshark-app), and can be used as an entry point for developing your own applications on or interfacing the LoShark.

## What is LoShark?
The LoShark LoRa USB dongle is a device that enables wireless communication over long distances using the LoRa protocol. It's perfect for IoT projects and remote communication needs.

## Usage

### Getting Started
1. **Download Firmware:**
	- Visit the [release page](https://github.com/SudoMaker/loshark-generic-firmware/tags) and download the latest firmware files: `app.sh`, `resonance_loshark`, and `loshark-sx126x.js`(choose according to your model, `sx1268` for 433MHz and `sx1262` for 915MHz).
2. **Copy Files:**
	- Rename the `loshark-sx126x.js` to `loshark.js`
	- Connect your LoShark dongle to your computer.
	- Transfer the downloaded files to the `app` directory on the MTP server of your LoShark dongle. MTP (Media Transfer Protocol) is a way to manage files on your dongle.
3. **Login to LoShark Shell:**
	If you confirm that your dongle has sync enabled, then just skip this step. If not, this step is **essential**.

	- Use `PuTTY` (Windows/Linux) or `Tabby` ([download here](https://github.com/Eugeny/tabby) for macOS) to access the LoShark's shell. The shell is like a command center for your dongle.
	- Default login:
		 ```
		 Username: root
		 Password: loshark
		 ```
	- In the shell, type `sync` and press Enter. This ensures your files are properly saved.
4. **Restart:**
	- Disconnect and reconnect (power cycle) your LoShark dongle or just run `reboot` in the shell.
5. **Access the Dashboard:**
	- Open your web browser and go to [LoShark Dashboard](https://su.mk/loshark-app).

### Enable File Syncing by Default
The first batch LoShark dongles might not sync file changes automatically. To enable this:

1. Log in to the LoShark shell (as described above).
2. Execute the following commands in order:
	 ```
	 mount / -wo,remount
	 vi /sbin/init-storage.sh
	 ```
	- In `vi`, navigate to the corresponding line, press `o`, then modify the line from `mount /dev/mmcblk0p2 /data || exit 2` to `mount -o sync /dev/mmcblk0p2 /data || exit 2`.
	- Save your changes: Press `ESC`, type `:wq`, and press `Enter`.
3. Type `sync` and press Enter.
4. Power cycle your LoShark.

## Building the Firmware

If you would like to change or develop the firmware of your own, you can build it yourself:

### Standard Build
1. Clone this repository to your computer.
2. In the cloned directory, run `pnpm install` in your command line or terminal.
3. Once the installation finishes, execute `pnpm build`.
4. Find the build result in the `dist` folder.

### Unminified Version
- Run `pnpm start` for a continuous dev server that outputs the latest build to the `dev` folder, reflecting file changes in real-time.

## About Resonance
Resonance, the JavaScript runtime, is currently offered as a pre-built binary. We plan to open-source it in a dedicated repo soon.

## Need Help?
If you encounter any issues or have questions, don't hesitate to open an issue.

## License
This project is licensed under the MIT License.
