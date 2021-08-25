from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec

'''
AUTOMATED TESTING - SELENIUM(Python)

Test Order:
1. Login
2. Select 'Context' Product Type
3. Populate Label with test case: https://pds.nasa.gov/data/pds4/context-pds4/investigation/other_investigation.wt_threshold_1.0.xml
4. Display Exported label XML preview

'''

driver = webdriver.Chrome(ChromeDriverManager().install())
driver.get("http://localhost:80")


# LOGIN ACCOUNT
input1 = driver.find_element_by_xpath('//*[@id="inputEmail"]')
input1.send_keys('Eyasu.T.Haile@jpl.nasa.gov')

input2 = driver.find_element_by_xpath('//*[@id="inputPassword"]')
input2.send_keys('pass')
submit = driver.find_element_by_xpath('//*[@id="logIn"]')
submit.click()


# CREATE NEW LABEL
create = driver.find_element_by_xpath('/html/body/div[1]/div[1]/div/div[1]/a')
create.click()

label1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, "/html/body/div[2]/div/div/div[3]/button[2]")))
label1.click()

label2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, "/html/body/div[3]/div/div/div[2]/p/form/div[1]/input")))
label2.send_keys('ContextLabel Test1')

context1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div[3]/div/div/div[3]/button[2]')))
context1.click()



# 
labelroot1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[1]/table/tbody/tr[3]/td/button/span')))
labelroot1.click()

labelroot2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[2]/div/div/div[3]/span[3]/button/i')))
labelroot2.click()

labelroot3 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[2]/div/div/div[4]/div[7]/span[3]/button/i')))
labelroot3.click()

labelroot4 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
labelroot4.click()

# IDENTIFICATION AREA CLASS
id_area1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[3]/div/div/div[1]/input[1]')))
id_area1.send_keys('urn:nasa:pds:context:investigation:other_investigation.wt_threshold')

id_area2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[3]/div/div/div[2]/input[1]')))
id_area2.send_keys('1.0')

id_area3 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[3]/div/div/div[3]/input[1]')))
id_area3.send_keys('Planetary Boundary Layer Wind Tunnel Particle Threshold')

id_area4 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[3]/div/div/div[4]/div/button/span[1]')))
id_area4.click()

id_area4 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/ul/li[6]/a')))
id_area4.click()

id_area5 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[3]/div/div/div[8]/span[3]/button/i')))
id_area5.click()

clickNext1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext1.click()

clickNext2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext2.click()


# MODIFICATION DETAIL
mod_details1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[5]/div/div/div[1]/input[1]')))
mod_details1.send_keys('2018-05-16')

mod_details2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[5]/div/div/div[2]/input[1]')))
mod_details2.send_keys('1.0')

mod_details3 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[5]/div/div/div[3]/input[1]')))
mod_details3.send_keys('Wind tunnel data and documentation for particle threshold for planetary boundary layer analog studies. Initial creation in conjunction with the Devon Burr PDART 2014 project regarding restoration and archiving of the Planetary Aeolian Laboratory historical data for Mars-, Venus-, Titan-, and Earth-analog environments.')

clickNext2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext2.click()




# REFERENCE LIST ADDED
ref_external1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[6]/div/div/div[2]/span[3]/button/i')))
ref_external1.click()

clickNext3 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext3.click()

ref_external2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[7]/div/div/div[1]/span[3]/button/i')))
ref_external2.click()

ref_external3 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[7]/div/div/div[1]/input[1]')))
ref_external3.send_keys('j.aeolia.2015.07.008')

ref_external4 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[7]/div/div/div[2]/input[1]')))
ref_external4.send_keys('The Titan Wind Tunnel: A new tool for investigating extraterrestrial aeolian environments, Aeolian Research, 18 205-214, 2015.')

clickNext4 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext4.click()



###
name_investigation1 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[8]/div/div/div[1]/span[3]/button/i')))
name_investigation1.click()

name_investigation2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[8]/div/div/div[1]/input[1]')))
name_investigation2.send_keys('wt_threshold')

start_investigation = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[8]/div/div/div[3]/input[1]')))
start_investigation.send_keys('2018-05-16')

stop_investigation = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[8]/div/div/div[4]/input[1]')))
stop_investigation.send_keys('')

desc_investigation = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[8]/div/div/div[5]/input[1]')))
desc_investigation.send_keys('Initially started as part of the PDART 2014 efforts of Devon Burr, this investigation is designed to acculumate planetary boundary layer wind tunnel data for planetary analogs of Mars, Venus, Titan, and Earth (and potentially others) for the purpose of investigating particle entrainment threshold wind speed data. Particle entrainment threshold denotes the wind speed at which a particle of a given size and density will begin to move in the airflow. Historically Ronald Greeley and James D. Iversen setup a series of wind tunnels to run in various planetary analog environments to investigate basic parameters for planetary aeolian processes spanning 1970s-2010s. This work is carried on by numerous former students and colleagues expanding what is known about sand and dust movement by wind processes on multiple planetary bodies.')

type_investigation = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[2]/section[8]/div/div/div[2]/div/button/span[1]')))
type_investigation.click()

type_investigation2 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div[2]/div/ul/li[6]/a/span[1]')))
type_investigation2.click()


clickNext5 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext5.click()

clickNext6 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext6.click()

clickNext7 = WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.XPATH, '/html/body/div/div[1]/div[3]/ul/li[2]/a')))
clickNext7.click()





