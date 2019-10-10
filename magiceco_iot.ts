/**
 * Custom blocks
 */
//% color=#0fbc11 icon="\uf1eb" weight=90
namespace ESP8266_IoT {

    let wifi_connected: boolean = false
    let thingspeak_connected: boolean = false
    let plaive_connected: boolean = false
    let plaive_last_upload_successful: boolean = false
    let ts_last_upload_successful: boolean = false

    let userToken_def: string = ""
    let topic_def: string = ""
    const EVENT_ON_ID = 100
    const EVENT_ON_Value = 200
    const EVENT_OFF_ID = 110
    const EVENT_OFF_Value = 210
    let toSendStr = ""

    export enum State {
        //% block="Success"
        Success,
        //% block="Fail"
        Fail
    }

    // write AT command with CR+LF ending
    function sendAT(command: string, wait: number = 0) {
        serial.writeString(command + "\u000D\u000A")
        basic.pause(wait)
    }

    // wait for certain response from ESP8266
    function waitResponse(): boolean {
        let serial_str: string = ""
        let result: boolean = false
        let time: number = input.runningTime()
	    
        while (true) {
            serial_str += serial.readString()
            if (serial_str.length > 200)
                serial_str = serial_str.substr(serial_str.length - 200)
            if (serial_str.includes("OK") || serial_str.includes("ALREADY CONNECTED")) {
                result = true
                break
            }
            if (serial_str.includes("ERROR") || serial_str.includes("FAIL")) {
                break
            }
            if ((input.runningTime() - time) > 5000) {
                break
            }
        }
        return result
    }
    /**
    * Initialize ESP8266 module 
    */
	//% inlineInputMode=external
    //% block="set ESP8266|RX %tx|TX %rx|Baud rate %baudrate"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    //% ssid.defl=your_ssid
    //% pw.defl=your_password
    export function initWIFI(tx: SerialPin, rx: SerialPin, baudrate: BaudRate) {

        serial.redirect(
            tx,
            rx,
            baudrate
        )
        sendAT("AT+RESTORE", 1000) // restore to factory settings
      
        //sendAT("AT+RST", 1000) // reset
        sendAT("AT+CWMODE=1",1000)
        sendAT("AT+CIPMUX=0",1000)
        sendAT("ATE0",1000)
        //sendAT("AT+GMR") // view version info
        
        basic.pause(100)
    }
    /**
    * connect to Wifi router
    */
	//% inlineInputMode=external
    //% block="connect Wifi|SSID = %ssid|KEY = %pw"
    //% ssid.defl=your_ssid
    //% pw.defl=your_pw
    export function connectWifi(ssid: string, pw: string) {

        wifi_connected = false
        thingspeak_connected = false
        plaive_connected = false
        //OLED.writeString("Connect Wifi : ")
        sendAT("AT+CWJAP=\"" + ssid + "\",\"" + pw + "\"", 0) // connect to Wifi router
        wifi_connected = waitResponse()
        
        /*
        if(wifi_connected == true)
            OLED.writeStringNewLine("OK")
        else
            OLED.writeStringNewLine("FAIL")
        */

        basic.pause(100)
    }
    /**
    * Connect to Plaive
    */
    //% block="connect Plaive"
    //% write_api_key.defl=your_write_api_key
    //% subcategory="Plaive"
    export function connectPlaive() {
        if (wifi_connected && thingspeak_connected == false) {
            plaive_connected = false
            let text = "AT+CIPSTART=\"TCP\",\"data.plaive.10make.com\",80"
            //let text = "AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80"
            
            sendAT(text, 0) // connect to website server
            plaive_connected = waitResponse()  
            basic.pause(100)
        }
    }

 /**
    * Connect to ThingSpeak
    */
    //% block="connect thingspeak"
    //% write_api_key.defl=your_write_api_key
    //% subcategory="ThingSpeak"
    export function connectThingSpeak() {
        if (wifi_connected && plaive_connected == false) {
            thingspeak_connected = false
            //let text = "AT+CIPSTART=\"TCP\",\"data.plaive.10make.com\",80"
            let text = "AT+CIPSTART=\"TCP\",\"api.thingspeak.com\",80"
            
            sendAT(text, 0) // connect to website server
            thingspeak_connected = waitResponse()  
            basic.pause(100)
        }
    }

    /**
    * Connect to Plaive and set data. 
    */
/* Set Data to Plaive with POST (not used)
	//% inlineInputMode=external
    //% block="set data to send Plaive|Write API key = %write_api_key|Field 1 = %n1|Field 2 = %n2" 
    //% write_api_key.defl=your_write_api_key
    //% subcategory="Plaive"
    export function setDataPlaive(write_api_key: string, n1: number, n2: number) {

        let data = "api_key=" + write_api_key
                    + "&field1=" + n1
                    + "&field2=" + n2
                //    + "&field3=" + n3
                //    + "&field4=" + n4
                //    + "&field5=" + n5
                //    + "&field6=" + n6
                //    + "&field7=" + n7
                //    + "&field8=" + n8 
	    if (plaive_connected) {
            toSendStr = "POST /insert.php"
            toSendStr = toSendStr + " HTTP/1.1" + "\r\n"
            toSendStr = toSendStr + "Host: data.plaive.10make.com" + "\r\n"
            toSendStr = toSendStr + "Content-Type: application/x-www-form-urlencoded" + "\r\n"
            toSendStr = toSendStr + "Content-Length: " + data.length + "\r\n\r\n"
            toSendStr = toSendStr + data
            //toSendStr = toSendStr + "Connection: close" + "\u000D\u000A" 
        }

    }
*/

/**
    * Connect to Plaive and set data. 
    */
    //% block="set data to send Plaive|Write API key = %write_api_key|Field 1 = %n1|Field 2 = %n2|Field 3 = %n3|Field 4 = %n4|Field 5 = %n5|Field 6 = %n6|Field 7 = %n7|Field 8 = %n8"
    //% write_api_key.defl=your_write_api_key
    //% subcategory="Plaive"
    export function setDataPlaive(write_api_key: string, n1: number, n2: number, n3: number, n4: number, n5: number, n6: number, n7: number, n8: number) {

        let data = "api_key=" + write_api_key
                    + "&field1=" + n1
                    + "&field2=" + n2
                    + "&field3=" + n3
                    + "&field4=" + n4
                    + "&field5=" + n5
                    + "&field6=" + n6
                    + "&field7=" + n7
                    + "&field8=" + n8 
	    if (plaive_connected) {
            toSendStr = "GET /insert.php?"
            toSendStr = toSendStr + data +" HTTP/1.1" + "\r\n"
            toSendStr = toSendStr + "Host: data.plaive.10make.com" + "\r\n"
            toSendStr = toSendStr + "Cache-Control: no-cache" + "\r\n"
            //toSendStr = toSendStr + "Content-Type: application/xE-www-form-urlencoded" + "\r\n"
            //toSendStr = toSendStr + "Content-Length: " + data.length + "\r\n"
            //toSendStr = toSendStr + data
            //toSendStr = toSendStr + "Connection: close" + "\r\n\r\n" 
        }
    }


/**
    * Connect to ThingSpeak and set data. 
    */
    //% block="set data to send ThingSpeak|Write API key = %write_api_key|Field 1 = %n1|Field 2 = %n2|Field 3 = %n3|Field 4 = %n4|Field 5 = %n5|Field 6 = %n6|Field 7 = %n7|Field 8 = %n8"
    //% write_api_key.defl=your_write_api_key
    //% subcategory="ThingSpeak"
    export function setDataThingSpeak(write_api_key: string, n1: number, n2: number, n3: number, n4: number, n5: number, n6: number, n7: number, n8: number) {
        if (thingspeak_connected) {
            toSendStr = "GET /update?api_key="
                + write_api_key
                + "&field1="
                + n1
                + "&field2="
                + n2
                + "&field3="
                + n3
                + "&field4="
                + n4
                + "&field5="
                + n5
                + "&field6="
                + n6
                + "&field7="
                + n7
                + "&field8="
                + n8
        }
    }


    /**
    * upload data. It would not upload anything if it failed to connect to Wifi or ThingSpeak.
    */
    //% block="Upload data to Plaive"
    //% subcategory="Plaive"
    export function uploadDataPlaive() {
        if (plaive_connected) {
            plaive_last_upload_successful = false
            sendAT("AT+CIPSEND=" + (toSendStr.length + 2), 100)
            sendAT(toSendStr, 100) // upload data
            plaive_last_upload_successful = waitResponse()
            sendAT("AT+CIPCLOSE",0)
            basic.pause(100)
        }
    }

   /**
    * upload data. It would not upload anything if it failed to connect to Wifi or ThingSpeak.
    */
    //% block="Upload data to ThingSpeak"
    //% subcategory="ThingSpeak"
    export function uploadDataThingSpeak() {
        if (thingspeak_connected) {
            ts_last_upload_successful = false
            sendAT("AT+CIPSEND=" + (toSendStr.length + 2), 100)
            sendAT(toSendStr, 100) // upload data
            ts_last_upload_successful = waitResponse()
            sendAT("AT+CIPCLOSE",0)
            basic.pause(100)
        }
    }

    /**
    * Wait between uploads
    */
    //% block="Wait %delay ms"
    //% delay.min=0 delay.defl=5000
    export function wait(delay: number) {
        if (delay > 0) basic.pause(delay)
    }

    /**
    * Check if ESP8266 successfully connected to Wifi
    */
    //% block="Wifi connected %State"
    export function wifiState(state: boolean) {
        if (wifi_connected == state) {
            return true
        }
        else {
            return false
        }
    }

    /**
    * Check if ESP8266 successfully connected to Plaive
    */
    //% block="Plaive connected %State"
    //% subcategory="Plaive"
    export function plaiveState(state: boolean) {
        if (plaive_connected == state) {
            return true
        }
        else {
            return false
        }
    }

 /**
    * Check if ESP8266 successfully connected to ThingSpeak
    */
    //% block="ThingSpeak connected %State"
    //% subcategory="ThingSpeak"
    export function thingSpeakState(state: boolean) {
        if (thingspeak_connected == state) {
            return true
        }
        else {
            return false
        }
    }

    /**
    * Check if ESP8266 successfully uploaded data to Plaive
    */
    //% block="Plaive Last data upload %State"
    //% subcategory="Plaive"
    export function plaiveLastUploadState(state: boolean) {
        if (plaive_last_upload_successful == state) {
            return true
        }
        else {
            return false
        }
    }

/**
    * Check if ESP8266 successfully uploaded data to ThingSpeak
    */
    //% block="ThingSpeak Last data upload %State"
    //% subcategory="ThingSpeak"
    export function tsLastUploadState(state: boolean) {
        if (ts_last_upload_successful == state) {
            return true
        }
        else {
            return false
        }
    }

}
