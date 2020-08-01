from django.conf import settings
from django.shortcuts import redirect, render
from django.urls import reverse
import datetime

uid_data = {}


def index(request):
    return redirect(reverse('images:index'))


def problem_report(request):
    if settings.PROBLEMS_TEXT is not '':
        return render(request, 'base/problem.html', {
            'text': settings.PROBLEMS_TEXT
        })
    else:
        return redirect(settings.PROBLEMS_URL)


def monitoring(request):
    if request.method == "POST":
        uid = request.POST.get('uid', None)
        if uid:
            uid_data[uid] = datetime.datetime.now()
            return uid_data[uid]
    else:
        data = []
        for k, v in uid_data:
            row = [k, v]
            if (datetime.datetime.now() - v) > 60:
                row.append('online')
            else:
                row.append('offline')
            data.append(row)

        return render(request, 'base/monitoring.html', {"data": data})
