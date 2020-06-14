'''
Simple Script that runs the speedtest in periodic time intervals
'''

import speedtest as speed
import fire
from time import time, sleep
import psycopg2 as psy

class Tester():
    def __init__(self, pwd, host, port="5432"):
        # connect to the database
        self.host = host
        self.port = port
        self.pwd = pwd
        self.connect()

        # defines the time interval in which checks should be done
        self.interval = 30
        self.flag_test = False

        # update data
        self.check_flags()

        self.run()
    
    def connect(self):
        '''Establishes connection to database.'''
        self.conn = None
        while (self.conn == None):
            try:
                self.conn = psy.connect(database="speedtest", user="postgres", password=self.pwd, host=self.host, port=self.port)
                print("INFO: connection established")
            except:
                print("WARNING: Unable to database, retry in 30 seconds")
                sleep(30)
        print("Connected to database")

    def check_connection(self):
        '''Checks the database connection and eventually resets it.'''
        try:
            cur = self.conn.cursor()
            cur.execute('SELECT 1')
            cur.close()
        except psy.OperationalError:
            self.connect()

    def run(self):
        '''Defines the main run cycle.'''
        run = True

        # main execution loop
        while(run):
            try:
                # check connection and run speedtest
                self.check_connection()
                self.collect()

                # map time and check difference until reached
                last_check = time()
                while (time() - last_check) < (self.interval * 60):
                    # check current flags
                    self.check_flags()

                    # check for test
                    if self.flag_test is True:
                        self.collect()
                        self.flag_test = False
                        self.update_flag("run_test", "false")
                    
                    # wait
                    sleep(10)
            except KeyboardInterrupt:
                print("Speedtest closed by user")
                run = False
        
        # close the connection
        self.conn.close()

    def collect(self):
        '''Collects a single speedtest.'''
        results = None
        while results is None:
            try:
                test = speed.Speedtest()
                test.get_best_server()
                test.download()
                test.upload()
                results = test.results.dict()
            except Exception as e:
                print("WARNING: Speedtest failed ({})".format(e))
                sleep(1)
        
        # convert to Mbits
        for v in ["download", "upload"]:
            results[v] = results[v] / (1024 * 1024)
        
        # print
        print("INFO: Current speed is: {:.2f} MB/s download - {:.2f} MB/s upload".format(results["download"], results["upload"]))

        # store the results
        self.store(results)

        return True
    
    def store(self, results):
        '''Stores the speedtest into the database.'''
        cur = self.conn.cursor()

        # create insert statement
        # TODO: add security checks that data is there?
        cur.execute("INSERT INTO speeds (download, upload, ping, measure_time, isp, ip, country) VALUES ({}, {}, {}, TO_TIMESTAMP('{}', 'YYYY-MM-DDTHH24:MI:SS.USZ'), '{}', '{}', '{}')".format(results["download"], results["upload"], results["ping"], results["timestamp"], results["client"]["isp"], results["client"]["ip"], results["client"]["country"]))
        self.conn.commit()

        cur.close()
    
    def check_flags(self):
        '''Reads from the Database to check if flags are set.'''
        cur = self.conn.cursor()

        cur.execute("SELECT item, value FROM settings")
        rows = cur.fetchall()
        for row in rows:
            key = row[0]
            value = row[1].lower()

            # parse settings
            if key == "run_test":
                self.flag_test = value == "true" or value == "1"
            elif key == "interval":
                self.interval = int(value)
            else:
                print("WARNING: unkown key {} with value {}".format(key, value))

        cur.close()

    def update_flag(self, key, value):
        cur = self.conn.cursor()
        cur.execute("INSERT INTO settings (item, value) VALUES ('{}', '{}') ON CONFLICT (item) SET value=excluded.value".format(key, value))
        conn.commit()
        cur.close()

def main(pwd, host, port):
    tester = Tester(pwd, host, port)

if __name__ == "__main__":
    fire.Fire(main)