FROM appcues/elixir-dev

EXPOSE 4444

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install
RUN mix deps.get

RUN curl -Lo /tmp/cb.tar.gz https://github.com/joyent/containerbuddy/releases/download/1.0.0/containerbuddy-1.0.0.tar.gz \
  && tar zxf /tmp/cb.tar.gz && mv containerbuddy /bin

RUN npm run webpack

COPY containerbuddy.json /etc/containerbuddy.json
ENV CONTAINERBUDDY=file:///etc/containerbuddy.json
ENV MIX_ENV="prod mix compile"

CMD /bin/containerbuddy mix run --no-halt
