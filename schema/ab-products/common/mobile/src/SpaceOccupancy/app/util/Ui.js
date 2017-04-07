Ext.define('SpaceOccupancy.util.Ui', {
    singleton: true,

    getPlanTypes: function () {
        var planTypes = [],
            spaceOccupancyPlanTypesStore = Ext.getStore('spaceOccupancyPlanTypes'),
            planTypeGroup = this.isWorkspaceTransactionsEnabled() ? 'Mobile Space and Occupancy trans' : 'Mobile Space and Occupancy',
            i,
            record;

        for (i = 0; i < spaceOccupancyPlanTypesStore.getData().length; i++) {
            record = spaceOccupancyPlanTypesStore.getData().get(i);
            if (record.get('plantype_group') === planTypeGroup) {
                planTypes.push(record.get('plan_type'));
            }
        }
        return planTypes;
    },

    getSurveyPlanType: function () {
        if (SurveyState.getSurveyState().isSurveyActive) {
            if (SurveyState.getWorkspaceTransactionsEnabled()) {
                return '17 - SURVEY-TRANS';
            } else {
                return '9 - SURVEY';
            }
        } else {
            return '9 - SURVEY';
        }
    },

    /**
     * Returns current date without time.
     */
    getCurrentDateValue: function () {
        var date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
    },

    /**
     * Returns current date without time formatted as Y-m-d H:i:s.u.
     */
    getCurrentDateValueFormatted: function () {
        return Ext.Date.format(this.getCurrentDateValue(), 'Y-m-d H:i:s.u');
    },

    /**
     * Returns the base64 string for the clear_icon.png image.
     */
    getDeleteIcon: function () {
        return 'iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAADHmlDQ1BJQ0MgUHJvZmlsZQAAeAGFVN9r01AU/tplnbDhizpnEQk+aJFuZFN0Q5y2a1e6zVrqNrchSJumbVyaxiTtfrAH2YtvOsV38Qc++QcM2YNve5INxhRh+KyIIkz2IrOemzRNJ1MDufe73/nuOSfn5F6g+XFa0xQvDxRVU0/FwvzE5BTf8gFeHEMr/GhNi4YWSiZHQA/Tsnnvs/MOHsZsdO5v36v+Y9WalQwR8BwgvpQ1xCLhWaBpXNR0E+DWie+dMTXCzUxzWKcECR9nOG9jgeGMjSOWZjQ1QJoJwgfFQjpLuEA4mGng8w3YzoEU5CcmqZIuizyrRVIv5WRFsgz28B9zg/JfsKiU6Zut5xCNbZoZTtF8it4fOX1wjOYA1cE/Xxi9QbidcFg246M1fkLNJK4RJr3n7nRpmO1lmpdZKRIlHCS8YlSuM2xp5gsDiZrm0+30UJKwnzS/NDNZ8+PtUJUE6zHF9fZLRvS6vdfbkZMH4zU+pynWf0D+vff1corleZLw67QejdX0W5I6Vtvb5M2mI8PEd1E/A0hCgo4cZCjgkUIMYZpjxKr4TBYZIkqk0ml0VHmyONY7KJOW7RxHeMlfDrheFvVbsrj24Pue3SXXjrwVhcW3o9hR7bWB6bqyE5obf3VhpaNu4Te55ZsbbasLCFH+iuWxSF5lyk+CUdd1NuaQU5f8dQvPMpTuJXYSWAy6rPBe+CpsCk+FF8KXv9TIzt6tEcuAcSw+q55TzcbsJdJM0utkuL+K9ULGGPmQMUNanb4kTZyKOfLaUAsnBneC6+biXC/XB567zF3h+rkIrS5yI47CF/VFfCHwvjO+Pl+3b4hhp9u+02TrozFa67vTkbqisXqUj9sn9j2OqhMZsrG+sX5WCCu0omNqSrN0TwADJW1Ol/MFk+8RhAt8iK4tiY+rYleQTysKb5kMXpcMSa9I2S6wO4/tA7ZT1l3maV9zOfMqcOkb/cPrLjdVBl4ZwNFzLhegM3XkCbB8XizrFdsfPJ63gJE722OtPW1huos+VqvbdC5bHgG7D6vVn8+q1d3n5H8LeKP8BqkjCtbCoV8yAAAACXBIWXMAAAsTAAALEwEAmpwYAAABbmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNC40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iPgogICAgICAgICA8ZGM6c3ViamVjdD4KICAgICAgICAgICAgPHJkZjpCYWcvPgogICAgICAgICA8L2RjOnN1YmplY3Q+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgrlPw1BAAAIWklEQVRoBdVbS2hVRxiee83LmJeaRBOTCKWgtIiJoQYNFAnSRSF205AqKEJ3urDQlq7aECuuCqUUzK5gS20XBUMLlQYaH3TRoGJsaTURN0mMryQGE40mJun3He65zL2ZmTPnZZOBm3POzPz//N/MN/88k1hcXBRxh2vXrlUsLCxsWbVq1WaUV5JIJIpRZi5+0/iewvc40gdvI7S1tc3GaU8iDsBXr17dlpOTsxeGt+C3G791NiBgyzzA30De83jvffLkye/Nzc1TNrK2eSIDDJBVAHkIhh6E0a/bGmDKB10zSO9G659ubGzswXdoOoYGfOXKlVcA9BOAPAzj8kwAwqQB67+QP3nr1q0fQfv5oLoCA+7r6yvJz88/joKPAmxOUAMCyN2cn58/umPHjt4AsiIQ4P7+/ndQWBeAVgUpNAoZtPgP0HOkvr5+0o8+X4ABMAGP+xkeHSgk4aegmPIOQO++7du3D9rqtwYMp1SIYeU0wL5rq/xl5ENLT8KmdoDusSkvaZPp8uXLtXBMfyw3sLQdNpUB9K/oZsdssHi2MMHm5ub2QfH/1l9tgDAPhq8TDQ0Nn5ryGwGTxmxZKGgwKVlOaQB9AKDp0JRBS2m0aIJ9FlIrBiwRJpPJb0DvN5Roma5LSHnjZeWgdLZmxRfguxv2V2fFO59KwBxn0cAcelZkgO3V+J29cOHCkgnRkojUDKoLSI3jbF1dnVi7dq22QsbGxsSdO3e06aaE2tpasW6dfr0xMjIixsfHTSrovXeWlZV9gExfyBmXtDCni8js6ZEJZm5uTtaV8b5+/XpRVFSUEWfzQRlTRT5+/FhMTEzYqCLoDjRgjZw5AzAXAkg8KmfQvWM+K4aGhnTJLEzU1NTQiWjzZCe4MnyqwosXLwRbF+OuKlkVV1RQUNApJ2RYk1r1LKG5LCC/Y70qHj58KEdlvIMtoqrKkyxpmY0bNwrK6ALBmlilkkPlHMTwWuempQFzPYuaPewm2DxZ0/fv3xfPnj3TZmdftKF2YWGhKC8v1+ohjUlnvwGYctGQH7lyacCIPIRI3+tZUnt4eNjVt+RJSm/atMmh+JJEKYJ5dPSfnZ0Vd+/e9UNlSbOg3MFz58451EkDZmRGLh8fMzMzjkE6EdK0ulo5LDoiGzZsEKtXr9aJO/2W/TdoQCuXobu0Ut4BDDpvQ2TgbRlSm8ME+7QqQLfjeVXUhlNxqMw8qvDgwQMxPT2tSvIVB/bsp4ADGHTe60takZnU5lCFuawiVQhMU51WzqYtWx7lK2XIHDpFVmjYAB0tnZ2d6TGjJaxCytN5sa/pAluTntgNprGaIFmBYajslsMnad3a2trg9uFmOTHoO4189OiR1pvK1M7LyxOVlZVaZ3bv3j3x9OnToKYo5VD+7hxukoNm+jmiUlQfSWqzlTnMqKjKOI7N9LwErQpTU1PObCoKKsv6AXhrEkq3ypFRvHtRmx65pKREWRQpzNaNispyIQC8JcnjDzkyqvfJyUmH3ip9pHa283LzcSITNZVd3WjczUl4VZ7zRB7orTmkPH/+3Fq3qZKslRgyoqJLkvgTC2CWS2qzxWz6IiuGeekD4gqwo5hemqd4sQWOpXRQXoEOzDTb8pK3TM8l4PDTGE1pnGxw2mhaAbmi7NfMy7E6xjBNLx3pcaRsLBfy2HWQo4zvrBiOzayoOAIqdYp92LxXErBkjsNsMVWgQ9P1a1ZSaWmpSix0HMocp5ceDK0pSwEnF5xCqiYezMp1Lfu2LnBiElN/HkzymgGQR+Ya2Re56C8uVjt/d23L2ZhucuFWWNTUhm0DSd6pwMsNXW37jSeV5QWCLE8ac2wmaC75OO/WUZszMdKbFRhVAJuvu4uH81EoZcuYdjcIUt5e5RTStD1EakfotRcB+KIDGLUc6DRdriS2REVFhbbvkb6jo6OyiLN2ZpxussHpJyswCmoD41+4JzLmAOZtGUTovUiGmeoP7mZwSFEF0pYLeVVrelF7zZo1guvmsNSGDb/QNgdw6mpQt8pYmzhSmXvQukCPzL6rC2xl05w7Cq8NtnzH8t0+THp9qzPIFM+ap0G6tS30eh65kAGm7SGWz+OXENT+070WkQYMfv+Ggnk1yFegNzWdA/GMyWa5R2qbjlDovDiRCUjtL11QacAAy52yk26CzRM3A4xUJk3piW0Dx2YTtekU2ad9hoHu7u6fXJk0YEbw0hceN91E05M1zX6rm02x/nyeAzle20uGp5Z+qA07jnd0dKS3UjMA84YbgtVhGmms26ZhRXFSQZr6DdljdbY8WcWhyiYA7CXc4zoj51Xe8cCB+Bm0oLNxLWdeSe8AOwcMDXBW/8h2Z7SwlHAE7wPS94p7BeBj2WAJQgk4dZ1vH4R8XetbLrUCu0/hJk+Xyh4lYGbkuAVKtEM4spWUyoAY4nqxGai9pKYFnALdg+eHMRgVi0o0zm2M+W179uzRHjUaAdMq0PsrzJZOxGJhhEoJFox8e9euXcYLIJ6AaROv8wH0Abzqj/ojNN6vKoA9j/n6TnZDL1krwFTC63xQ/CZ+mWs8rxJiToc9p9Bn3/JqWdcM5TjsJqqevOEG6pzFb6cq/WXFAegcfsd03lhnh3ULuwpQwChqtBmFfYw4/1MpV1GIJ8q+hAqHKeqhx6TadwvLynjpC6uYThjA/2SJ9QQjVe4AyvocjvR72Q4/775bWFbe1NQ0AkfxPubfryL+axgT10SlD/rbsep5LQxY2h6qhalADrwahM2AfWjt9wC+BU/7YwdZkXPTaPFv6PiZOxU23jdTXP8VKWC5GF4g4Z0KgG7Gbwt+WwFgM57FeHLTml1gGt/8d7wxvHNmN4Dh7zp+F7nhJuuL6v0/Vc+vwPfknLsAAAAASUVORK5CYII=';
    },

    /**
     * Returns the base64 string for the discosure image, same used by css class .x-field-input .x-arrow.
     */
    getDisclosureIcon: function () {
        return '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TUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MTwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6Q29tcHJlc3Npb24+NTwvdGlmZjpDb21wcmVzc2lvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyPC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NDA8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpDb2xvclNwYWNlPjE8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjM1PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGRjOnN1YmplY3Q+CiAgICAgICAgICAgIDxyZGY6QmFnLz4KICAgICAgICAgPC9kYzpzdWJqZWN0PgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxNC0wNy0zMVQxNzowNzo2ODwveG1wOk1vZGlmeURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UGl4ZWxtYXRvciAzLjI8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CpZGq+kAAAL1SURBVFgJ7ZZLbhNBEIZnxs+xfQcfAIHYcQAj7pCQ8MiGQ7DmEAmEoAiJQ6CIBSuWLFiwQfKOPQSP33zt3zTjGU/NYCJlk1bUqu6urq9ePU64XC6D6xjRdUAd8waczjzl15jNZtpfLBZpBcnobN3Pa6Z3Qq6l1xkZiyiEYah9+VE/PXTLZ++m0ylH8/m8VqshRFHkNTN28kurxvJJprmJXQCOOrxwf8d7jUaDfcFwsTrVWcv74ncw5HOIMJlMgDmkxopdr9elhk/+YhXBSrUSixUEqPH50V+qt90fkHOyzcY/sUsixqKCjr9+9KwNYRW3aqzScOqFDc3NhQVGk7qSTJfkuw+Ce08D4suPFRtNvKT/UabpcFce59W1UwKWUrPZdLbu3LfZuIg+4coJ5iIq+9aZO44ikAgyasWN0vEeaqSdWG0qulZzcT/9VLTEYvj5ffDpbEujYS/Va07zzweAk8ywIuam6kQQyOog18Bl9VbQBhUnLDDHgslZDKl+Lvll7Ex8+aVrh+qDuGEroAi2hv+keEPDi8aXD8654lEScfoiSP1aMOOBe2PFlZ7fvoV++npGtporo8oSW6rcaDTa/iFDqT+4PHjVarXWDyFvZbVTkmo1F/GJqk8jERvU0aPX3ThOksQGl0QsMFRgMkTE4cl+0Vv6+fBlr9cjMVykFQqiddslNYYCklltxQWD+mP/pNvtEqtzrvgFyxsrYrxmgMQKAnlunj0uipUMx3GMjpAEvXvEmEi94+8GdfzkjaguJWE4Ho8VljFbqVapdLmWFNjqD34dnvIrQkVEBdxut+1w0bTAmFCeERz+4EX2Z7E/IMOdTkdIYOr/tb67UzisGnPJP9y1gctvwdvn6zKvqLxXvqBEjKaohajNgxIwyuovCa5lkqFjB8H06Jx/9siwsnLFYMzJIrMam75FoJXYAc9Mhukmgr6yiDHKoGCqGTxIgCEx8z3hlB14HHk1dqqM8lRXsbKDjtXVO5irfuUGXD1X/6n5G2OA0GQWo90DAAAAAElFTkSuQmCC';
    },

    /**
     * Set the title of the view as 'Room bl-fl-rm'.
     */
    displayRoomTitle: function (view, record) {
        var roomTitle = LocaleManager.getLocalizedString('Room', 'SpaceOccupancy.util.Ui') + ': ' +
            record.get('bl_id') + '-' + record.get('fl_id') + '-' + record.get('rm_id');

        view.setTitle(roomTitle);
    },

    /**
     * Create a new RoomPct record and set the values for bl, fl, rm and survey.
     */
    createTransactionRecord: function (roomRecord) {
        var transactionRecord = new SpaceOccupancy.model.RoomPct(),
            blId = roomRecord.get('bl_id'),
            flId = roomRecord.get('fl_id'),
            rmId = roomRecord.get('rm_id'),
            surveyId = roomRecord.get('survey_id');

        transactionRecord.set('survey_id', surveyId);
        transactionRecord.set('bl_id', blId);
        transactionRecord.set('fl_id', flId);
        transactionRecord.set('rm_id', rmId);
        transactionRecord.set('date_start', this.getCurrentDateValue());
        transactionRecord.set('primary_rm', '0');
        transactionRecord.set('primary_em', '0');

        return transactionRecord;
    },

    /**
     * Create a new EmployeeSurvey record and set the values for bl, fl, rm and survey.
     */
    createEmployeeSurveyRecord: function (roomRecord) {
        var employeeSurveyRecord = new SpaceOccupancy.model.EmployeeSurvey(),
            blId = roomRecord.get('bl_id'),
            flId = roomRecord.get('fl_id'),
            rmId = roomRecord.get('rm_id'),
            surveyId = roomRecord.get('survey_id');

        employeeSurveyRecord.set('survey_id', surveyId);
        employeeSurveyRecord.set('bl_id', blId);
        employeeSurveyRecord.set('fl_id', flId);
        employeeSurveyRecord.set('rm_id', rmId);

        return employeeSurveyRecord;
    },

    /**
     * Verify if workspace transactions are enabled or not using the value of activity parameter UseWorkspaceTransactions.
     * @return boolean true if workspace transactions are enabled, else false.
     */
    isWorkspaceTransactionsEnabled: function () {
        var preferencesStore = Ext.getStore('appPreferencesStore'),
            param, paramValue;

        param = preferencesStore.findRecord('param_id', 'UseWorkspaceTransactions');
        paramValue = param.get('param_value');

        return (paramValue === '1');
    },

    setActionPicker: function (downloadActionPicker) {
        var surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            data = [
                {
                    action: 'start',
                    text: LocaleManager.getLocalizedString('Download Floor Plans', 'SpaceOccupancy.util.Ui')
                }
            ],
            store;


        if (!Ext.isEmpty(surveyId)) {
            data.push({
                action: 'goToSurvey',
                text: LocaleManager.getLocalizedString('Active Survey: ', 'SpaceOccupancy.util.Ui') + surveyId
            })
        }

        store = new Ext.data.Store({
            storeId: 'dropDownOccupancyDownloadListStore',
            data: data

        });

        //reset the list panel to display the new items and set the new store
        downloadActionPicker.listPanel = null;
        downloadActionPicker.setStore(store);
    }
});