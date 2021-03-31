# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np

fullData = pd.read_csv('football.csv', parse_dates=True)

fullData2 = pd.read_csv('football.csv', parse_dates=True)

fullData = fullData.sort_values(by=['date'])

fullData = fullData[fullData['date'] >= '2000-01-01']

fullData2 = fullData[fullData['date'] >= '2000-01-01']

fullData['total_games'] = 1

barplotData = fullData

barplotData['date'] = barplotData['date'].apply(lambda x: x[0:4])

barplotData = barplotData[['date', 'total_games']].groupby(by=['date']).sum()

barplotData.to_csv('../gamesPerYear.csv')


#print(barplotData.head())

worldmapData = fullData

teams1 = list(set(worldmapData['home_team'].values))

teams2 =  list(set(worldmapData['away_team'].values))

teams = list(set((teams1 + teams2)))

teams.sort()

#print(len(teams))

num_wins = {}

num_games = {}

num_points = {}

for team in teams:
    
    num_wins[team] = 0
    
    num_games[team] = 0
    
    num_points[team] = 0
    
#print(num_wins)
npfullData = fullData.to_numpy()





for row in npfullData:
    date = row[0]
    homeTeam =row[1]
    awayTeam =row[2]
    homeScore =row[3]
    awayScore =row[4]
   
 
    #print(homeTeam)
    #print(awayTeam)
    #print(count)
    
  
    
    if homeScore > awayScore:
        num_wins[homeTeam] +=1
        num_games[homeTeam] +=1
        num_games[awayTeam] +=1
        
    if awayScore > homeScore:
        num_wins[awayTeam] +=1
        num_games[homeTeam] +=1
        num_games[awayTeam] +=1
        
    if awayScore == homeScore:
        num_games[homeTeam] +=1
        num_games[awayTeam] +=1
        
win_ratio = {}
      
for country in num_wins.keys():
    win_ratio[country] = (num_wins[country] / num_games[country] ) * (num_games[country] / (num_games[country] + 10))
    
worldmapData = pd.DataFrame(list(zip(win_ratio.keys(), num_games.values(), num_wins.values(), win_ratio.values())),columns = ['country','num_games', 'num_wins','win_ratio'])

#worldmapData = worldmapData[worldmapData['num_games'] >= 50]

worldmapData = worldmapData.sort_values(by=['win_ratio'], ascending=False)

worldmapData.to_csv('../winningRatio.csv', index=False)
#print(win_ratio)


def calculate_points(importance_coef, game_result, expected_result):
    
    return (importance_coef * (game_result - expected_result))

def expected_res(team1Rating, team2Rating):
    return 1 / (10**(-1 *(abs(team1Rating - team2Rating) / 600)) + 1)


scatterData = fullData2


scatterData = scatterData[((scatterData['tournament'] == 'FIFA World Cup')| (scatterData['tournament'] == 'FIFA World Cup qualification')) & (scatterData['date'] >'2010-01-01')]

scatterData['coeff'] = 0
#print(scatterData.iloc[-1])

#print(len(scatterData[scatterData['date'] < '2018-07-15']))
scatterData.iloc[0:854,9] = 25
scatterData.iloc[1780:,9] = 25

scatterData.iloc[918:1716,9] = 25 

scatterData.iloc[854:910,9] = 50
scatterData.iloc[1716:1772,9] = 50

scatterData.iloc[910:918,9] = 60
scatterData.iloc[1772:1780,9] = 60

#print(scatterData.iloc[1780])
#print(scatterData.iloc[912])
#print(scatterData['coeff'].values)
    


npscatter = scatterData.to_numpy()
#print(len(scatterData))
dates = []

countries = []

num_points_overtime = []

for row in npscatter:
    date = row[0]
    homeTeam =row[1]
    awayTeam =row[2]
    homeScore =row[3]
    awayScore =row[4]
    
    
    
    dates.append(date)
    dates.append(date)
    
    
    countries.append(homeTeam)
    countries.append(awayTeam)
    
    
    home_previous_points = num_points[homeTeam]
    
    #print(row[9])
    
    away_previous_points = num_points[awayTeam]
    '''
    if homeTeam == 'Spain':
        print(home_previous_points)
    if awayTeam =='Spain':
        print(away_previous_points)
    '''
    if homeScore > awayScore:
     
    
        '''
        if homeTeam == 'Spain':
            
            print(home_previous_points)
            print(calculate_points(row[9], 1, expected_res(home_previous_points, away_previous_points)))
            
            
        if awayTeam == 'Spain':
            
            print(away_previous_points)
            print(calculate_points(row[9], 0, expected_res(home_previous_points, away_previous_points)))
            
        '''
        home_points = home_previous_points + calculate_points(row[9], 1, expected_res(home_previous_points, away_previous_points))
        away_points = away_previous_points + calculate_points(row[9], 0, expected_res(home_previous_points, away_previous_points))
        
            
        num_points_overtime.append(home_points)
        num_points_overtime.append(away_points)
        
        num_points[homeTeam] +=  calculate_points(row[9], 1, expected_res(home_previous_points, away_previous_points))
        num_points[awayTeam] += calculate_points(row[9], 0, expected_res(home_previous_points, away_previous_points))
        
        
    if awayScore > homeScore:
        '''
        if homeTeam == 'Spain':
            
            print(home_previous_points)
            print(calculate_points(row[9], 0, expected_res(home_previous_points, away_previous_points)))
            
        if awayTeam == 'Spain':
            
            print(away_points)
            print(calculate_points(row[9], 1, expected_res(home_previous_points, away_previous_points)))
         '''
        home_points = home_previous_points + calculate_points(row[9], 0, expected_res(home_previous_points, away_previous_points))
        away_points = away_previous_points + calculate_points(row[9], 1, expected_res(home_previous_points, away_previous_points))
        
        
        
        num_points_overtime.append(home_points)
        num_points_overtime.append(away_points)
        
        num_points[homeTeam] += calculate_points(row[9], 0, expected_res(home_previous_points, away_previous_points))
        num_points[awayTeam] += calculate_points(row[9], 1, expected_res(home_previous_points, away_previous_points))
        
    if awayScore == homeScore:
        '''
        if homeTeam == 'Spain':
            
            print(home_points)
            print(calculate_points(row[9], 0.5, expected_res(home_previous_points, away_previous_points)))
            
            
        if awayTeam == 'Spain':
            
            print(away_points)
            print(calculate_points(row[9], 0.5, expected_res(home_previous_points, away_previous_points)))
       '''
        home_points = home_previous_points + calculate_points(row[9], 0.5, expected_res(home_previous_points, away_previous_points))
        away_points = away_previous_points + calculate_points(row[9], 0.5, expected_res(home_previous_points, away_previous_points))
        
       
        
        num_points_overtime.append(home_points)
        num_points_overtime.append(away_points)
        
        num_points[homeTeam] +=  calculate_points(row[9], 0.5, expected_res(home_previous_points, away_previous_points))
        num_points[awayTeam] += calculate_points(row[9], 0.5, expected_res(home_previous_points, away_previous_points))
        
    
points = pd.DataFrame(list(zip(dates, countries, num_points_overtime)),columns = ['date','country', 'points'])



points = points.sort_values(by=['date'])

points = points[(points['country'] == 'Belgium') | (points['country'] == 'Germany') | (points['country'] == 'France') | (points['country'] == 'Netherlands') | (points['country'] == 'Spain') | (points['country'] == 'Brazil') | (points['country'] == 'Iran') | (points['country'] == 'Portugal') | (points['country'] == 'Japan') | (points['country'] == 'Switzerland')]

#print(points[points['country'] == 'Spain'])

#print(len(points))
#points.to_csv('../totalPointsOverTime.csv', index=False)

tot_points = pd.DataFrame(list(zip(num_points.keys(), num_points.values())),columns = ['country', 'tot_points'])

tot_points.to_csv('../totalPoints.csv', index=False)

#print(tot_points.sort_values(by=['tot_points'], ascending=False)[0:10])

print(points[points['country'] == 'Brazil' ])