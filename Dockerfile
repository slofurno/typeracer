FROM appcues/elixir-dev

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN npm install
RUN mix deps.get

RUN curl -Lo /tmp/cb.tar.gz https://github.com/joyent/containerbuddy/releases/download/1.4.0-rc3/containerbuddy-1.4.0-rc3.tar.gz \
  && tar zxf /tmp/cb.tar.gz && mv containerbuddy /bin

RUN npm run webpack

COPY containerbuddy.json /etc/containerbuddy.json
COPY bin/* /opt/containerbuddy/
ENV CONTAINERBUDDY=file:///etc/containerbuddy.json
ENV MIX_ENV="prod mix compile"

CMD ["/bin/containerbuddy", "mix", "run", "--no-halt"]
